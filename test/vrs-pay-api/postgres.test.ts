/**
 * vrs-pay-api — the real Prisma stores on Postgres: new columns round-trip,
 * batched writes keep one ledger posting per payment and one delivery per
 * event, and deleting a customer cascades. Runs only when
 * VRS_TEST_DATABASE_URL points at a migrated database (never production):
 *
 *   DIRECT_URL=$VRS_TEST_DATABASE_URL bun run --cwd apps/vrs-pay-api db:migrate:deploy
 *   VRS_TEST_DATABASE_URL=postgresql://… bun test test/vrs-pay-api/postgres.test.ts
 */
import { afterAll, describe, expect, test } from "bun:test";
import { createLedgerTransaction, money, payoutPosting, reversePosting } from "@vrs-pay/core";
import { renewSubscription } from "../../apps/vrs-pay-api/src/services/billing-engine.service";
import { emptyOnboarding } from "../../apps/vrs-pay-api/src/services/onboarding.types";
import { DATABASE_URL, postgresHarness } from "./postgres-harness";
import {
  checkoutCompleted,
  stripeEvent as fixtureEvent,
  setupCompleted,
  signedStripeRequest,
} from "./stripe-fixtures";

/** Stripe event ids are unique; the fixture's counter restarts each run, and this database doesn't. */
const stripeEvent = (type: string, object: object) => ({
  ...fixtureEvent(type, object),
  id: `evt_${crypto.randomUUID()}`,
});

const opened: Array<() => Promise<void>> = [];
afterAll(async () => {
  await Promise.all(opened.map((close) => close()));
});

async function setUp() {
  const h = await postgresHarness(DATABASE_URL ?? "");
  opened.push(h.close);
  const deliver = async (event: object) =>
    (await (await h.app.request("/webhooks/stripe", await signedStripeRequest(event))).json())
      .outcome;
  return { ...h, deliver };
}

const PLAN = {
  name: "Power",
  prices: [
    {
      amount: 2700,
      currency: "gbp",
      interval: "month",
      interval_count: 3,
      nickname: "Quarterly",
      lookup_key: `power_${crypto.randomUUID()}`,
      currency_options: { eur: { amount: 3100 } },
    },
  ],
  trial_days: 0,
  features: { storage_gb: 100 },
  images: ["https://cdn.vrs.test/power.png"],
  marketing_features: [{ name: "100 GB" }],
  metadata: { tier: "power" },
};

describe.skipIf(!DATABASE_URL)("on Postgres", () => {
  test("products and prices keep every detail; lookup keys move in one save", async () => {
    const { call } = await setUp();
    const product = await (await call("/v1/products", { body: PLAN })).json();
    const read = await (await call(`/v1/products/${product.id}`)).json();
    const { prices: _, ...extras } = PLAN;
    expect(read).toMatchObject(extras);
    const [price] = read.prices;
    expect(price).toMatchObject({
      interval: "month",
      interval_count: 3,
      nickname: "Quarterly",
      currency_options: { eur: { amount: 3100 } },
    });
    const moved = await (
      await call("/v1/prices", {
        body: {
          product: product.id,
          amount: 2900,
          currency: "gbp",
          interval: "month",
          interval_count: 3,
          lookup_key: price.lookup_key,
          transfer_lookup_key: true,
        },
      })
    ).json();
    const found = await (await call(`/v1/prices?lookup_keys=${price.lookup_key}`)).json();
    expect(found.data.map((p: { id: string }) => p.id)).toEqual([moved.id]);
  });

  test("a paid checkout writes one posting, its events and one delivery per event", async () => {
    const { call, db, deliver, merchantId } = await setUp();
    await call("/v1/webhook_endpoints", { body: { url: "https://hooks.vrs.test/in" } });
    const session = await (
      await call("/v1/checkout/sessions", {
        body: {
          amount: 4900,
          currency: "gbp",
          success_url: "https://shop.test/ok",
          cancel_url: "https://shop.test/no",
        },
      })
    ).json();
    const paid = stripeEvent(
      "checkout.session.completed",
      checkoutCompleted(session.provider_reference, session.id),
    );
    expect(await deliver(paid)).toBe("processed");
    expect(await deliver(paid)).toBe("duplicate");
    const [payment] = (await (await call("/v1/payments")).json()).data;
    const postings = await db.ledgerTransaction.findMany({
      where: { sourceId: payment.id },
      include: { entries: true },
    });
    expect(postings).toHaveLength(1);
    expect(postings[0]?.entries.length).toBeGreaterThanOrEqual(2);
    const events = await db.event.count({ where: { merchantId } });
    expect(events).toBeGreaterThan(0);
    const deliveries = await db.webhookDelivery.count({ where: { event: { merchantId } } });
    expect(deliveries).toBe(events);
  });

  test("a chargeback saves one row, posts each balance change once and is won back", async () => {
    const { call, db, deliver } = await setUp();
    const session = await (
      await call("/v1/checkout/sessions", {
        body: {
          amount: 4900,
          currency: "gbp",
          success_url: "https://shop.test/ok",
          cancel_url: "https://shop.test/no",
        },
      })
    ).json();
    await deliver(
      stripeEvent(
        "checkout.session.completed",
        checkoutCompleted(session.provider_reference, session.id),
      ),
    );
    const [payment] = (await (await call("/v1/payments")).json()).data;
    const disputeId = `dp_${crypto.randomUUID()}`;
    const disputeObject = (status: string, moves: Array<{ amount: number; fee: number }>) => ({
      id: disputeId,
      object: "dispute",
      amount: 4900,
      currency: "gbp",
      charge: "ch_pg",
      payment_intent: payment.provider_reference,
      reason: "fraudulent",
      status,
      evidence_details: { due_by: 1_900_000_000 },
      balance_transactions: moves.map((m) => ({ ...m, currency: "gbp" })),
    });
    const withdrawn = { amount: -4900, fee: 2000 };
    expect(
      await deliver(
        stripeEvent("charge.dispute.created", disputeObject("needs_response", [withdrawn])),
      ),
    ).toBe("processed");
    expect(
      await deliver(
        stripeEvent("charge.dispute.funds_withdrawn", disputeObject("needs_response", [withdrawn])),
      ),
    ).toBe("duplicate");
    expect(
      await deliver(
        stripeEvent(
          "charge.dispute.closed",
          disputeObject("won", [withdrawn, { amount: 4900, fee: 0 }]),
        ),
      ),
    ).toBe("processed");
    const row = await db.dispute.findUnique({
      where: { provider_providerReference: { provider: "stripe", providerReference: disputeId } },
    });
    expect(row).toMatchObject({ status: "won", amountWithdrawn: 0n, fee: 2000n, version: 1 });
    const postings = await db.ledgerTransaction.count({
      where: { sourceType: "dispute", sourceId: { startsWith: row?.id ?? "?" } },
    });
    expect(postings).toBe(2);
    const listed = (await (await call("/v1/disputes")).json()).data;
    expect(listed).toMatchObject([{ id: row?.id, status: "won", evidence_due_by: null }]);
  });

  test("payouts: one per merchant, currency and day; a bank reversal posts the money back once", async () => {
    const { db, deps, merchantId } = await setUp();
    const newPayout = (id: string, day: string) => ({
      merchantId,
      mode: "test" as const,
      day,
      payout: {
        id,
        object: "payout" as const,
        livemode: false,
        status: "pending" as const,
        amount: 4_660_000,
        fee: 7_500,
        currency: "ngn",
        rail: "paystack" as const,
        destination: { bank_name: "Guaranty Trust Bank", last4: "6789" },
        provider_reference: id.toLowerCase(),
        failure_message: null,
        created: Math.floor(Date.now() / 1000),
      },
    });
    const posting = (id: string) => ({
      ledger: {
        mode: "test" as const,
        source: { type: "payout" as const, id },
        transaction: createLedgerTransaction({
          description: `Payout ${id}`,
          entries: payoutPosting({
            merchantId,
            provider: "paystack",
            amount: money(4_660_000, "NGN"),
            fee: money(7_500, "NGN"),
          }),
        }),
      },
    });
    const first = `po_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
    const second = `po_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
    expect(await deps.payouts.create(newPayout(first, "2026-10-20"), posting(first))).toBe(true);
    expect(await deps.payouts.create(newPayout(second, "2026-10-20"), posting(second))).toBe(false);
    const paid = await deps.payouts.settle(
      first,
      { status: "paid", failureMessage: null },
      () => ({}),
    );
    expect(paid?.payout.status).toBe("paid");
    const reversal = () => ({
      ledger: {
        mode: "test" as const,
        source: { type: "payout" as const, id: `${first}:returned` },
        transaction: createLedgerTransaction({
          description: "returned",
          entries: reversePosting(posting(first).ledger.transaction.entries),
        }),
      },
    });
    const back = await deps.payouts.settle(
      first,
      { status: "failed", failureMessage: "reversed" },
      reversal,
    );
    expect(back?.payout).toMatchObject({ status: "failed", failure_message: "reversed" });
    expect(
      await deps.payouts.settle(first, { status: "failed", failureMessage: "again" }, reversal),
    ).toBeNull();
    expect(
      await db.ledgerTransaction.count({
        where: { sourceType: "payout", sourceId: { startsWith: first } },
      }),
    ).toBe(2);
    expect((await deps.payouts.find("paystack", first.toLowerCase()))?.payout.id).toBe(first);
    expect((await deps.payouts.list(merchantId, "test", 10)).map((p) => p.payout.id)).toEqual([
      first,
    ]);
  });

  test("a subscription keeps the currency it started in", async () => {
    const { call, db, deliver } = await setUp();
    const product = await (
      await call("/v1/products", {
        body: { ...PLAN, prices: [{ ...PLAN.prices[0], lookup_key: undefined }] },
      })
    ).json();
    const customer = await (
      await call("/v1/customers", { body: { external_id: "user_1", email: "a@b.test" } })
    ).json();
    const session = await (
      await call("/v1/checkout/sessions", {
        body: {
          mode: "subscription",
          price: product.prices[0].id,
          customer: customer.id,
          currency: "eur",
          success_url: "https://shop.test/ok",
          cancel_url: "https://shop.test/no",
        },
      })
    ).json();
    await deliver(
      stripeEvent(
        "checkout.session.completed",
        checkoutCompleted(session.provider_reference, session.id, session.amount),
      ),
    );
    const sub = await (await call(`/v1/subscriptions/${session.subscription}`)).json();
    expect(sub).toMatchObject({ status: "active", currency: "eur" });
    const row = await db.subscription.findUnique({ where: { id: sub.id } });
    expect(row?.currency).toBe("EUR");
  });

  test("an abandoned link checkout's customer is deleted with its subscription", async () => {
    const { app, call, db, deliver, merchantId } = await setUp();
    const product = await (
      await call("/v1/products", {
        body: { ...PLAN, prices: [{ ...PLAN.prices[0], lookup_key: undefined }] },
      })
    ).json();
    const link = await (
      await call("/v1/payment_links", { body: { price: product.prices[0].id } })
    ).json();
    await app.request(`/l/${link.id}`, { method: "POST" });
    expect(await db.subscription.count({ where: { merchantId } })).toBe(1);
    const session = await db.checkoutSession.findFirst({ where: { merchantId } });
    await deliver(
      stripeEvent("checkout.session.expired", {
        id: session?.providerReference,
        object: "checkout.session",
      }),
    );
    expect(await db.customer.count({ where: { merchantId } })).toBe(0);
    expect(await db.subscription.count({ where: { merchantId } })).toBe(0);
  });

  test("metered usage adds up in SQL, and small usage carries over", async () => {
    const { call, deliver, deps } = await setUp();
    const product = await (
      await call("/v1/products", {
        body: {
          name: "API",
          prices: [{ amount: 10, currency: "gbp", interval: "month", usage_type: "metered" }],
        },
      })
    ).json();
    const customer = await (
      await call("/v1/customers", { body: { external_id: "user_1", email: "a@b.test" } })
    ).json();
    const session = await (
      await call("/v1/checkout/sessions", {
        body: {
          mode: "subscription",
          price: product.prices[0].id,
          customer: customer.id,
          success_url: "https://shop.test/ok",
          cancel_url: "https://shop.test/no",
        },
      })
    ).json();
    await deliver(
      stripeEvent(
        "checkout.session.completed",
        setupCompleted(session.provider_reference, session.id),
      ),
    );
    const id = session.subscription;
    for (const quantity of [3, 1]) {
      await call(`/v1/subscriptions/${id}/usage_records`, { body: { quantity } });
    }
    expect((await (await call(`/v1/subscriptions/${id}/usage`)).json()).quantity).toBe(4);
    const sub = await deps.billing.findSubscription(id);
    if (!sub) throw new Error("subscription missing");
    const end = sub.subscription.current_period_end ?? 0;
    expect(await renewSubscription(deps, sub, end + 1)).toBe(true);
    const renewed = await deps.billing.findSubscription(id);
    // 4 × 10p is under the minimum charge, so nothing is invoiced and it carries over.
    expect(renewed?.usageFrom).toBe(sub.subscription.current_period_start);
    expect(
      await deps.billing.listInvoices(
        { merchantId: sub.merchantId, mode: "test" },
        {
          subscriptionId: id,
        },
      ),
    ).toHaveLength(0);
  });

  test("setup keeps the identity session, recent checks and registration number", async () => {
    const { deps, merchantId } = await setUp();
    const record = {
      ...emptyOnboarding(merchantId),
      businessType: "company" as const,
      registrationNumber: "RC 1234567",
      identityStatus: "pending" as const,
      identitySessionId: "vs_test_123",
      identityAttempts: [1_791_000_000, 1_791_000_600],
    };
    await deps.onboarding.save(record);
    expect(await deps.onboarding.get(merchantId)).toMatchObject({
      registrationNumber: "RC 1234567",
      identitySessionId: "vs_test_123",
      identityAttempts: [1_791_000_000, 1_791_000_600],
    });
  });
});
