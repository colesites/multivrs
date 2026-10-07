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

  test("setup keeps the identity session and registration number", async () => {
    const { deps, merchantId } = await setUp();
    const record = {
      ...emptyOnboarding(merchantId),
      businessType: "company" as const,
      registrationNumber: "RC 1234567",
      identityStatus: "pending" as const,
      identitySessionId: "vs_test_123",
    };
    await deps.onboarding.save(record);
    expect(await deps.onboarding.get(merchantId)).toMatchObject({
      registrationNumber: "RC 1234567",
      identitySessionId: "vs_test_123",
    });
  });
});
