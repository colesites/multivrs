import { describe, expect, test } from "bun:test";
import { paidPayment } from "./flows";

describe("GET /v1/payments & /v1/payments/:id", () => {
  test("lists payments with status filtering and search query", async () => {
    const { call, paymentId } = await paidPayment();

    // Succeeded payment exists
    const allRes = await call("/v1/payments");
    expect(allRes.status).toBe(200);
    const all = await allRes.json();
    expect(all.data.length).toBeGreaterThanOrEqual(1);

    const succeededRes = await call("/v1/payments?status=succeeded");
    const succeeded = await succeededRes.json();
    expect(succeeded.data.some((p: any) => p.id === paymentId)).toBe(true);

    const refundedRes = await call("/v1/payments?status=refunded");
    const refunded = await refundedRes.json();
    expect(refunded.data.some((p: any) => p.id === paymentId)).toBe(false);

    // Search by payment ID
    const searchRes = await call(`/v1/payments?search=${paymentId}`);
    const searchResult = await searchRes.json();
    expect(searchResult.data.length).toBe(1);
    expect(searchResult.data[0].id).toBe(paymentId);

    // Search by non-matching query returns empty
    const noMatchRes = await call("/v1/payments?search=nonexistent_xyz");
    const noMatchResult = await noMatchRes.json();
    expect(noMatchResult.data.length).toBe(0);
  });

  test("search and the customer filter look through the payment's checkout session", async () => {
    const { call, paymentId, session, state } = await paidPayment();
    const stored = state.sessions.get(session.id);
    if (!stored) throw new Error("session missing");
    stored.session = { ...stored.session, description: "Annual Pro plan", customer: "cus_buyer" };
    const ids = async (query: string) =>
      (await (await call(`/v1/payments?${query}`)).json()).data.map((p: { id: string }) => p.id);
    expect(await ids("search=annual%20pro")).toEqual([paymentId]);
    expect(await ids("customer=cus_buyer")).toEqual([paymentId]);
    expect(await ids("customer=cus_someone_else")).toEqual([]);
  });

  test("returns payment details with net calculation and linked refunds", async () => {
    const { call, paymentId } = await paidPayment();

    // Initial payment details
    const initRes = await call(`/v1/payments/${paymentId}`);
    expect(initRes.status).toBe(200);
    const initPayment = await initRes.json();
    expect(initPayment.id).toBe(paymentId);
    expect(initPayment.net).toBe(
      initPayment.amount - initPayment.provider_fee - initPayment.platform_fee,
    );
    expect(initPayment.refunds).toEqual([]);

    // Create a partial refund
    const refundRes = await call("/v1/refunds", {
      body: { payment: paymentId, amount: 1500, reason: "requested_by_customer" },
    });
    expect(refundRes.status).toBe(200);
    const refund = await refundRes.json();

    // Detail endpoint now includes the refund
    const detailRes = await call(`/v1/payments/${paymentId}`);
    expect(detailRes.status).toBe(200);
    const detail = await detailRes.json();
    expect(detail.status).toBe("partially_refunded");
    expect(detail.amount_refunded).toBe(1500);
    expect(detail.refunds).toHaveLength(1);
    expect(detail.refunds[0].id).toBe(refund.id);
    expect(detail.refunds[0].amount).toBe(1500);

    // Filter payments by partially_refunded status
    const filterRes = await call("/v1/payments?status=partially_refunded");
    const filtered = await filterRes.json();
    expect(filtered.data.some((p: any) => p.id === paymentId)).toBe(true);
  });

  test("exports payments as RFC 4180 CSV via /v1/payments/export and ?format=csv", async () => {
    const { call, paymentId } = await paidPayment();

    // GET /v1/payments/export
    const exportRes = await call("/v1/payments/export");
    expect(exportRes.status).toBe(200);
    expect(exportRes.headers.get("content-type")).toContain("text/csv");
    expect(exportRes.headers.get("content-disposition")).toContain("attachment; filename=");
    const csvText = await exportRes.text();
    expect(csvText).toContain("Payment ID,Date (UTC),Status,Amount,Currency,Net Amount");
    expect(csvText).toContain(paymentId);
    expect(csvText).toContain("49.00");
    expect(csvText).toContain("GBP");

    // GET /v1/payments?format=csv with status filter
    const csvFilterRes = await call(`/v1/payments?format=csv&status=succeeded`);
    expect(csvFilterRes.status).toBe(200);
    const filterCsv = await csvFilterRes.text();
    expect(filterCsv).toContain(paymentId);

    // Filter where it doesn't match
    const noMatchCsvRes = await call(`/v1/payments?format=csv&status=refunded`);
    expect(noMatchCsvRes.status).toBe(200);
    const noMatchCsv = await noMatchCsvRes.text();
    expect(noMatchCsv).not.toContain(paymentId);
  });

  test("returns payments analytics with key metrics, time-series and breakdowns", async () => {
    const { call, paymentId } = await paidPayment();

    const res = await call("/v1/payments/analytics?range=30");
    expect(res.status).toBe(200);
    const analytics = await res.json();

    expect(analytics).toMatchObject({
      object: "payments.analytics",
      range_days: 30,
    });
    expect(analytics.metrics.accepted_volume.value).toBe(4900);
    expect(analytics.metrics.accepted_payments.value).toBe(1);
    expect(analytics.metrics.success_rate.value).toBeGreaterThan(0);
    expect(Array.isArray(analytics.time_series)).toBe(true);
    expect(analytics.time_series.length).toBe(30);

    // Breakdown includes stripe method
    expect(Array.isArray(analytics.breakdown.methods)).toBe(true);
    expect(analytics.breakdown.methods.length).toBeGreaterThanOrEqual(1);
  });
});
