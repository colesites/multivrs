/**
 * vrs-pay-api — price details like Stripe's: a description, a lookup key,
 * and one price sold in several currencies. A subscription keeps the
 * currency it started in, through renewals and plan changes.
 */
import { describe, expect, test } from "bun:test";
import { billingSetup } from "./billing-flows";
import { checkoutCompleted, stripeEvent } from "./stripe-fixtures";

const PLAN = {
  name: "Power",
  prices: [
    {
      amount: 900,
      currency: "gbp",
      interval: "month",
      nickname: "Launch price",
      lookup_key: "power_monthly",
      currency_options: { EUR: { amount: 1000 }, usd: { amount: 1100 } },
    },
    { amount: 1500, currency: "gbp", interval: "month", lookup_key: "power_plus" },
  ],
};

async function withPlan() {
  const setup = await billingSetup();
  const product = await (await setup.call("/v1/products", { body: PLAN })).json();
  const [power, plus] = product.prices;
  /** Subscribes the setup's customer to `price` in `currency` and pays the first period. */
  async function subscribe(price: string, currency?: string) {
    const session = await (await setup.checkout(price, currency ? { currency } : {})).json();
    await setup.deliver(
      stripeEvent(
        "checkout.session.completed",
        checkoutCompleted(session.provider_reference, session.id, session.amount),
      ),
    );
    const sub = await (await setup.call(`/v1/subscriptions/${session.subscription}`)).json();
    return { session, sub };
  }
  return { ...setup, product, power, plus, subscribe };
}

describe("price details", () => {
  test("a price keeps its description, lookup key and other currencies", async () => {
    const { power } = await withPlan();
    expect(power).toMatchObject({
      nickname: "Launch price",
      lookup_key: "power_monthly",
      currency: "gbp",
      currency_options: { eur: { amount: 1000 }, usd: { amount: 1100 } },
    });
  });

  test("currency options can't repeat the price's currency or use unknown ones", async () => {
    const { call, product } = await withPlan();
    const add = async (options: object) => {
      const res = await call("/v1/prices", {
        body: { product: product.id, amount: 100, currency: "gbp", currency_options: options },
      });
      return [res.status, (await res.json()).error?.param];
    };
    expect(await add({ GBP: { amount: 100 } })).toEqual([400, "currency_options.GBP"]);
    expect(await add({ XYZ: { amount: 100 } })).toEqual([400, "currency_options.XYZ"]);
  });

  test("lookup keys are unique; transfer_lookup_key moves one, as on Stripe", async () => {
    const { call, product, power } = await withPlan();
    const body = { product: product.id, amount: 990, currency: "gbp", interval: "month" };
    const taken = await call("/v1/prices", { body: { ...body, lookup_key: "power_monthly" } });
    expect([taken.status, (await taken.json()).error.code]).toEqual([400, "lookup_key_taken"]);
    const moved = await (
      await call("/v1/prices", {
        body: { ...body, lookup_key: "power_monthly", transfer_lookup_key: true },
      })
    ).json();
    const list = async (keys: string) =>
      (await (await call(`/v1/prices?lookup_keys=${keys}`)).json()).data;
    expect((await list("power_monthly")).map((p: { id: string }) => p.id)).toEqual([moved.id]);
    expect(await list("power_monthly,power_plus")).toHaveLength(2);
    expect((await (await call(`/v1/prices/${power.id}`)).json()).lookup_key).toBeNull();
  });

  test("descriptions and lookup keys can change; amounts can't", async () => {
    const { call, plus } = await withPlan();
    const relabeled = await (
      await call(`/v1/prices/${plus.id}`, { body: { nickname: "Plus", lookup_key: null } })
    ).json();
    expect(relabeled).toMatchObject({ nickname: "Plus", lookup_key: null, amount: 1500 });
    const amount = await call(`/v1/prices/${plus.id}`, { body: { amount: 1 } });
    expect(amount.status).toBe(400);
  });
});

describe("one price, several currencies", () => {
  test("a subscription started in euros pays and renews in euros", async () => {
    const { cycle, power, stripeApi, subscribe } = await withPlan();
    const { session, sub } = await subscribe(power.id, "eur");
    expect(session).toMatchObject({ amount: 1000, currency: "eur" });
    expect(sub).toMatchObject({ status: "active", currency: "eur", price: power.id });
    await cycle(sub.current_period_end + 1);
    expect(stripeApi.calls.charges[0]?.params).toMatchObject({ amount: 1000, currency: "eur" });
  });

  test("a currency the price isn't sold in is refused", async () => {
    const { checkout, plus } = await withPlan();
    const res = await checkout(plus.id, { currency: "eur" });
    expect([res.status, (await res.json()).error.code]).toEqual([400, "currency_unavailable"]);
  });

  test("plan changes need a price sold in the subscription's currency", async () => {
    const { call, plus, power, product, subscribe } = await withPlan();
    const { sub } = await subscribe(power.id, "eur");
    const noEuros = await call(`/v1/subscriptions/${sub.id}`, { body: { price: plus.id } });
    expect((await noEuros.json()).error.code).toBe("price_incompatible");
    const euroPlus = await (
      await call("/v1/prices", {
        body: {
          product: product.id,
          amount: 1500,
          currency: "gbp",
          interval: "month",
          currency_options: { eur: { amount: 1700 } },
        },
      })
    ).json();
    const upgraded = await call(`/v1/subscriptions/${sub.id}`, { body: { price: euroPlus.id } });
    expect(upgraded.status).toBe(200);
  });

  test("a payment link can sell a price in one of its other currencies", async () => {
    const { app, call, power, state } = await withPlan();
    const link = await (
      await call("/v1/payment_links", { body: { price: power.id, currency: "usd" } })
    ).json();
    expect(link).toMatchObject({ amount: 1100, currency: "usd" });
    expect((await app.request(`/l/${link.id}`)).status).toBe(303);
    const subscriptions = [...state.subscriptions.values()];
    expect(subscriptions.at(-1)?.subscription).toMatchObject({ currency: "usd" });
  });
});
