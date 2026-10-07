/**
 * vrs-pay-api — usage-based billing like Stripe's metered prices: the
 * checkout saves a card, the merchant reports usage, and each period's
 * usage is charged when it ends.
 */
import { describe, expect, test } from "bun:test";
import { billingSetup } from "./billing-flows";
import { MERCHANT } from "./harness";
import { setupCompleted, stripeEvent } from "./stripe-fixtures";

const API_CALLS = {
  name: "API",
  prices: [{ amount: 10, currency: "gbp", interval: "month", usage_type: "metered" }],
};

/** A customer on a metered price, card saved, first period running. */
async function metered(price: object = {}, product: object = {}) {
  const setup = await billingSetup();
  const body = { ...API_CALLS, ...product, prices: [{ ...API_CALLS.prices[0], ...price }] };
  const created = await (await setup.call("/v1/products", { body })).json();
  const session = await (await setup.checkout(created.prices[0].id)).json();
  await setup.deliver(
    stripeEvent(
      "checkout.session.completed",
      setupCompleted(session.provider_reference, session.id),
    ),
  );
  const sub = await (await setup.call(`/v1/subscriptions/${session.subscription}`)).json();
  const report = (quantity: number, timestamp?: number) =>
    setup.call(`/v1/subscriptions/${sub.id}/usage_records`, { body: { quantity, timestamp } });
  const summary = async () => (await setup.call(`/v1/subscriptions/${sub.id}/usage`)).json();
  const invoices = async () =>
    (await (await setup.call(`/v1/invoices?subscription=${sub.id}`)).json()).data;
  return { ...setup, product: created, session, sub, report, summary, invoices };
}

describe("metered prices", () => {
  test("only recurring prices are metered; they add usage up by sum unless told", async () => {
    const { call } = await billingSetup();
    const bad = async (price: object) =>
      (
        await call("/v1/products", {
          body: { name: "X", prices: [{ ...API_CALLS.prices[0], ...price }] },
        })
      ).status;
    expect(await bad({ interval: "one_time" })).toBe(400);
    expect(await bad({ usage_type: "licensed", aggregate_usage: "max" })).toBe(400);
    const product = await (await call("/v1/products", { body: API_CALLS })).json();
    expect(product.prices[0]).toMatchObject({ usage_type: "metered", aggregate_usage: "sum" });
  });

  test("the checkout only saves a card; the subscription starts active", async () => {
    const { session, stripeApi, sub } = await metered();
    expect(session.amount).toBe(0);
    expect(stripeApi.calls.sessions[0]?.params.mode).toBe("setup");
    expect(sub.status).toBe("active");
    expect(sub.trial_end).toBeNull();
  });
});

describe("usage", () => {
  test("reported usage adds up for the period and shows what's due", async () => {
    const { report, summary } = await metered();
    for (const quantity of [10, 5, 20]) expect((await report(quantity)).status).toBe(200);
    expect(await summary()).toMatchObject({
      object: "usage_summary",
      aggregate_usage: "sum",
      quantity: 35,
      unit_amount: 10,
      currency: "gbp",
      amount_due: 350,
    });
  });

  test("usage before the period or for a licensed subscription is refused", async () => {
    const { call, checkout, deliver, priceOf, report, sub } = await metered();
    const early = await report(1, sub.current_period_start - 60);
    expect((await early.json()).error.code).toBe("timestamp_outside_period");
    const session = await (await checkout(priceOf("pro"))).json();
    await deliver(
      stripeEvent("checkout.session.completed", {
        ...setupCompleted(session.provider_reference, session.id),
      }),
    );
    const licensed = await call(`/v1/subscriptions/${session.subscription}/usage_records`, {
      body: { quantity: 1 },
    });
    expect((await licensed.json()).error.code).toBe("subscription_not_metered");
  });

  test("highest or latest reading, for prices that aggregate by max or last", async () => {
    for (const [aggregate, expected] of [
      ["max", 9],
      ["last", 4],
    ] as const) {
      const { report, summary, sub } = await metered({ aggregate_usage: aggregate });
      const t = sub.current_period_start;
      await report(3, t + 1);
      await report(9, t + 2);
      await report(4, t + 3);
      expect((await summary()).quantity).toBe(expected);
    }
  });
});

describe("billing usage", () => {
  test("at period end the usage is invoiced and charged, and a new period starts at zero", async () => {
    const { cycle, invoices, report, stripeApi, sub, summary } = await metered();
    await report(10);
    await report(25);
    await cycle(sub.current_period_end + 1);
    const [invoice] = await invoices();
    expect(invoice).toMatchObject({
      status: "paid",
      total: 350,
      period_start: sub.current_period_start,
      period_end: sub.current_period_end,
      lines: [{ kind: "usage", quantity: 35, amount: 350 }],
    });
    expect(stripeApi.calls.charges[0]?.params).toMatchObject({ amount: 350, currency: "gbp" });
    expect(await summary()).toMatchObject({
      period_start: sub.current_period_end,
      quantity: 0,
    });
  });

  test("a period without usage costs nothing and makes no invoice", async () => {
    const { call, cycle, invoices, stripeApi, sub } = await metered();
    await cycle(sub.current_period_end + 1);
    expect(await invoices()).toHaveLength(0);
    expect(stripeApi.calls.charges).toHaveLength(0);
    const renewed = await (await call(`/v1/subscriptions/${sub.id}`)).json();
    expect(renewed.current_period_start).toBe(sub.current_period_end);
  });

  test("canceling at period end still bills the last period's usage", async () => {
    const { call, cycle, invoices, report, sub } = await metered();
    await report(30);
    await call(`/v1/subscriptions/${sub.id}/cancel`, { body: { at: "period_end" } });
    await cycle(sub.current_period_end + 1);
    expect((await (await call(`/v1/subscriptions/${sub.id}`)).json()).status).toBe("canceled");
    expect(await invoices()).toMatchObject([{ total: 300, lines: [{ kind: "usage" }] }]);
  });

  test("usage too small to charge carries into the next period's invoice", async () => {
    const { call, cycle, deps, invoices, report, sub, summary } = await metered();
    await report(4);
    await cycle(sub.current_period_end + 1);
    expect(await invoices()).toHaveLength(0);
    const second = await (await call(`/v1/subscriptions/${sub.id}`)).json();
    // The engine's clock is simulated; the API refuses future timestamps, so record directly.
    await deps.usage.add({
      merchantId: MERCHANT.id,
      mode: "test",
      record: {
        id: "mbur_next_period",
        object: "usage_record",
        livemode: false,
        subscription: sub.id,
        quantity: 20,
        timestamp: second.current_period_start + 1,
      },
    });
    expect(await summary()).toMatchObject({ quantity: 24, amount_due: 240 });
    await cycle(second.current_period_end + 1);
    expect(await invoices()).toMatchObject([
      {
        total: 240,
        period_start: sub.current_period_start,
        period_end: second.current_period_end,
      },
    ]);
  });

  test("fixed prices and one-off charges must cover the fees; metered unit prices needn't", async () => {
    const { call } = await metered();
    const fixed = await call("/v1/products", {
      body: { name: "Tiny", prices: [{ amount: 50, currency: "gbp" }] },
    });
    expect([fixed.status, (await fixed.json()).error.code]).toEqual([400, "amount_too_small"]);
    const link = await call("/v1/payment_links", {
      body: { amount: 50, currency: "gbp", description: "Tip" },
    });
    expect((await link.json()).error.code).toBe("amount_too_small");
  });

  test("usage during a trial is free; the subscription turns active when it ends", async () => {
    const { call, cycle, invoices, report, sub } = await metered({}, { trial_days: 7 });
    expect(sub.status).toBe("trialing");
    await report(50);
    expect((await (await call(`/v1/subscriptions/${sub.id}/usage`)).json()).amount_due).toBe(0);
    await cycle(sub.current_period_end + 1);
    expect(await invoices()).toHaveLength(0);
    expect((await (await call(`/v1/subscriptions/${sub.id}`)).json()).status).toBe("active");
  });

  test("a metered subscription can only switch to another metered price", async () => {
    const { call, priceOf, product, sub } = await metered();
    const licensed = await call(`/v1/subscriptions/${sub.id}`, { body: { price: priceOf("pro") } });
    expect((await licensed.json()).error.code).toBe("price_incompatible");
    const cheaper = await (
      await call("/v1/prices", {
        body: {
          product: product.id,
          amount: 1,
          currency: "gbp",
          interval: "month",
          usage_type: "metered",
        },
      })
    ).json();
    const switched = await (
      await call(`/v1/subscriptions/${sub.id}`, { body: { price: cheaper.id } })
    ).json();
    expect(switched).toMatchObject({ price: cheaper.id, pending_price: null });
  });
});
