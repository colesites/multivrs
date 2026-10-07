/**
 * vrs-pay-api — POST/GET /v1/refunds: full and partial refunds, over-refund
 * protection, provider failures and refunds made in the Stripe Dashboard.
 */
import { describe, expect, test } from "bun:test";
import { computeBalances, creditBalance } from "@vrs-pay/core";
import { paidPayment } from "./flows";
import { stripeEvent } from "./stripe-fixtures";

const MERCHANT_BALANCE = { kind: "merchant_balance", owner: "mer_test" } as const;

describe("POST /v1/refunds", () => {
  test("a full refund succeeds, is posted to the ledger and sent as an event", async () => {
    const { call, paymentId, state, stripeApi } = await paidPayment();
    const res = await call("/v1/refunds", {
      body: { payment: paymentId, reason: "requested_by_customer" },
    });
    expect(res.status).toBe(200);
    const refund = await res.json();
    expect(refund).toMatchObject({
      object: "refund",
      status: "succeeded",
      amount: 4900,
      currency: "gbp",
      payment: paymentId,
    });
    expect(stripeApi.calls.refunds[0]?.options).toEqual({ idempotencyKey: refund.id });

    const payment = await (await call(`/v1/payments/${paymentId}`)).json();
    expect(payment).toMatchObject({ status: "refunded", amount_refunded: 4900 });
    const balances = computeBalances(state.ledger.map((p) => p.transaction));
    // The merchant was owed 4900 − our 285 fee; the full refund comes out of that.
    expect(creditBalance(balances, MERCHANT_BALANCE, "GBP")).toBe(4615 - 4900);
    expect(state.events.map((e) => e.event.type)).toEqual([
      "payment.succeeded",
      "refund.succeeded",
    ]);
    expect((await (await call(`/v1/refunds/${refund.id}`)).json()).status).toBe("succeeded");
  });

  test("partial refunds can't go over the payment", async () => {
    const { call, paymentId } = await paidPayment();
    expect((await call("/v1/refunds", { body: { payment: paymentId, amount: 3000 } })).status).toBe(
      200,
    );
    const over = await call("/v1/refunds", { body: { payment: paymentId, amount: 2000 } });
    expect([over.status, (await over.json()).error.code]).toEqual([400, "amount_too_large"]);
    const rest = await (await call("/v1/refunds", { body: { payment: paymentId } })).json();
    expect(rest.amount).toBe(1900);
    const done = await call("/v1/refunds", { body: { payment: paymentId } });
    expect((await done.json()).error.code).toBe("payment_already_refunded");
  });

  test("a rejected refund fails and frees the amount", async () => {
    const { call, paymentId, state, stripeApi } = await paidPayment();
    stripeApi.options.failWith = Object.assign(new Error("Charge already refunded"), {
      type: "StripeInvalidRequestError",
    });
    const res = await call("/v1/refunds", { body: { payment: paymentId } });
    expect([res.status, (await res.json()).error.code]).toEqual([502, "provider_request_failed"]);
    const [refund] = [...state.refunds.values()];
    expect(refund?.refund.status).toBe("failed");
    expect(state.payments.get(paymentId)?.payment).toMatchObject({
      status: "succeeded",
      amount_refunded: 0,
    });
    expect(state.events.at(-1)?.event.type).toBe("refund.failed");
  });

  test("a network failure leaves the refund pending until Stripe's webhook settles it", async () => {
    const { call, deliver, paymentId, paymentReference, state, stripeApi } = await paidPayment();
    stripeApi.options.failWith = Object.assign(new Error("socket hang up"), {
      type: "StripeConnectionError",
    });
    expect((await call("/v1/refunds", { body: { payment: paymentId } })).status).toBe(502);
    const [pending] = [...state.refunds.values()];
    expect(pending?.refund.status).toBe("pending");
    expect(state.payments.get(paymentId)?.payment.amount_refunded).toBe(4900);

    const refund = {
      id: "re_late",
      amount: 4900,
      currency: "gbp",
      status: "succeeded",
      payment_intent: paymentReference,
      metadata: { vrs_refund_id: pending?.refund.id },
    };
    expect((await deliver(stripeEvent("refund.updated", refund))).outcome).toBe("processed");
    expect(state.refunds.get(pending?.refund.id ?? "")?.refund).toMatchObject({
      status: "succeeded",
      provider_reference: "re_late",
    });
  });

  test("a refund made in the Stripe Dashboard is recorded too", async () => {
    const { call, deliver, paymentId, paymentReference } = await paidPayment();
    const refund = {
      id: "re_dash",
      amount: 1000,
      currency: "gbp",
      status: "succeeded",
      payment_intent: paymentReference,
      metadata: {},
    };
    expect((await deliver(stripeEvent("refund.created", refund))).outcome).toBe("processed");
    expect((await deliver(stripeEvent("refund.updated", refund))).outcome).toBe("duplicate");
    const payment = await (await call(`/v1/payments/${paymentId}`)).json();
    expect(payment).toMatchObject({ status: "partially_refunded", amount_refunded: 1000 });
  });

  test("an Idempotency-Key retry returns the same refund without a second Stripe call", async () => {
    const { call, paymentId, stripeApi } = await paidPayment();
    const send = () =>
      call("/v1/refunds", {
        body: { payment: paymentId, amount: 500 },
        headers: { "Idempotency-Key": "refund-1" },
      });
    const first = await (await send()).json();
    const retry = await send();
    expect(retry.headers.get("Idempotent-Replayed")).toBe("true");
    expect((await retry.json()).id).toBe(first.id);
    expect(stripeApi.calls.refunds).toHaveLength(1);
  });

  test("another merchant can't see or refund the payment", async () => {
    const { call, otherKey, paymentId } = await paidPayment();
    const res = await call("/v1/refunds", { body: { payment: paymentId }, key: otherKey });
    expect([res.status, (await res.json()).error.code]).toEqual([404, "resource_missing"]);
    expect((await call(`/v1/payments/${paymentId}`, { key: otherKey })).status).toBe(404);
  });
});
