/**
 * vrs-pay-api — billing periods like Stripe's: daily, weekly, monthly,
 * every 3 or 6 months, yearly, or a custom count of any of them.
 */
import { describe, expect, test } from "bun:test";
import { addInterval } from "../../apps/vrs-pay-api/src/services/billing-helpers";
import { monthsPerPeriod, periodLabel } from "../../apps/vrs-pay-api/src/services/billing-period";
import { billingSetup } from "./billing-flows";
import { checkoutCompleted, stripeEvent } from "./stripe-fixtures";

const DAY = 86_400;
const COACHING = {
  name: "Coaching",
  prices: [
    { amount: 2700, currency: "gbp", interval: "month", interval_count: 3 },
    { amount: 900, currency: "gbp", interval: "month" },
    { amount: 400, currency: "gbp", interval: "week", interval_count: 2 },
  ],
};

async function withCoaching() {
  const setup = await billingSetup();
  const product = await (await setup.call("/v1/products", { body: COACHING })).json();
  const [quarterly, monthly, fortnightly] = product.prices;
  /** Subscribes the setup's customer to `price` and pays the first period. */
  async function subscribe(price: string) {
    const session = await (await setup.checkout(price)).json();
    await setup.deliver(
      stripeEvent(
        "checkout.session.completed",
        checkoutCompleted(session.provider_reference, session.id, session.amount),
      ),
    );
    return (await setup.call(`/v1/subscriptions/${session.subscription}`)).json();
  }
  return { ...setup, product, quarterly, monthly, fortnightly, subscribe };
}

describe("billing periods", () => {
  test("prices charge every N days, weeks, months or years, up to three years", async () => {
    const { call, product, quarterly, monthly } = await withCoaching();
    expect(quarterly).toMatchObject({ interval: "month", interval_count: 3 });
    expect(monthly).toMatchObject({ interval: "month", interval_count: 1 });
    const tooLong = await call("/v1/prices", {
      body: {
        product: product.id,
        amount: 100,
        currency: "gbp",
        interval: "month",
        interval_count: 37,
      },
    });
    expect([tooLong.status, (await tooLong.json()).error.param]).toEqual([400, "interval_count"]);
    const oneTimeCount = await call("/v1/prices", {
      body: { product: product.id, amount: 100, currency: "gbp", interval_count: 2 },
    });
    expect(oneTimeCount.status).toBe(400);
    const daily = await call("/v1/prices", {
      body: { product: product.id, amount: 100, currency: "gbp", interval: "day" },
    });
    expect(await daily.json()).toMatchObject({ interval: "day", interval_count: 1 });
  });

  test("a fortnightly subscription's periods are 14 days, renewal included", async () => {
    const { call, cycle, fortnightly, subscribe } = await withCoaching();
    const sub = await subscribe(fortnightly.id);
    expect(sub.current_period_end - sub.current_period_start).toBe(14 * DAY);
    await cycle(sub.current_period_end + 1);
    const renewed = await (await call(`/v1/subscriptions/${sub.id}`)).json();
    expect(renewed.current_period_start).toBe(sub.current_period_end);
    expect(renewed.current_period_end).toBe(sub.current_period_end + 14 * DAY);
  });

  test("plan changes keep the billing period: monthly can't become every 3 months", async () => {
    const { call, monthly, quarterly, subscribe } = await withCoaching();
    const sub = await subscribe(monthly.id);
    const res = await call(`/v1/subscriptions/${sub.id}`, { body: { price: quarterly.id } });
    expect([res.status, (await res.json()).error.code]).toEqual([400, "price_incompatible"]);
  });

  test("payment links carry the period of the price they sell", async () => {
    const { call, quarterly } = await withCoaching();
    const link = await (await call("/v1/payment_links", { body: { price: quarterly.id } })).json();
    expect(link).toMatchObject({ interval: "month", interval_count: 3, amount: 2700 });
  });

  test("period math, labels and monthly revenue", () => {
    const jan31 = Date.UTC(2026, 0, 31) / 1000;
    expect(addInterval(jan31, "day", 3)).toBe(jan31 + 3 * DAY);
    expect(addInterval(jan31, "week", 2)).toBe(jan31 + 14 * DAY);
    expect(new Date(addInterval(jan31, "month", 3) * 1000).toISOString()).toBe(
      "2026-04-30T00:00:00.000Z",
    );
    expect(periodLabel("month", 1)).toBe("monthly");
    expect(periodLabel("month", 6)).toBe("every 6 months");
    expect(monthsPerPeriod({ interval: "month", interval_count: 3 })).toBe(3);
    expect(monthsPerPeriod({ interval: "year", interval_count: 1 })).toBe(12);
    expect(monthsPerPeriod({ interval: "week", interval_count: 1 })).toBeCloseTo(0.23, 2);
  });
});
