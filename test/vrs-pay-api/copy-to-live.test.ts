/**
 * vrs-pay-api — "Copy to live mode": a test product made again in live
 * mode from the dashboard, with its active prices and extras.
 */
import { describe, expect, test } from "bun:test";
import { dashboardHarness } from "./dashboard-harness";

const PRODUCT = {
  name: "Pro",
  description: "Everything in Basic, and more",
  prices: [
    { amount: 900, currency: "gbp", interval: "month", lookup_key: "pro_monthly" },
    {
      amount: 9000,
      currency: "gbp",
      interval: "year",
      currency_options: { eur: { amount: 10000 } },
    },
  ],
  trial_days: 14,
  features: { seats: 5 },
  marketing_features: [{ name: "5 seats" }],
  metadata: { tier: "pro" },
};

describe("copy to live", () => {
  test("a test product and its active prices are made again in live mode", async () => {
    const { dash } = await dashboardHarness();
    const product = await (await dash("/v1/products", { body: PRODUCT })).json();
    const [monthly] = product.prices;
    await dash(`/v1/prices/${product.prices[1].id}`, { body: { active: false } });
    const copy = await (await dash(`/products/${product.id}/copy-to-live`, { body: {} })).json();
    expect(copy).toMatchObject({
      livemode: true,
      name: "Pro",
      trial_days: 14,
      features: { seats: 5 },
      metadata: { tier: "pro" },
      prices: [{ amount: 900, interval: "month", lookup_key: "pro_monthly", livemode: true }],
    });
    expect(copy.id).not.toBe(product.id);
    expect(copy.prices[0].id).not.toBe(monthly.id);
    const live = (await (await dash("/v1/products", { mode: "live" })).json()).data;
    expect(live.map((p: { id: string }) => p.id)).toEqual([copy.id]);
  });

  test("a lookup key already used in live mode stops a second copy", async () => {
    const { dash } = await dashboardHarness();
    const product = await (await dash("/v1/products", { body: PRODUCT })).json();
    await dash(`/products/${product.id}/copy-to-live`, { body: {} });
    const again = await dash(`/products/${product.id}/copy-to-live`, { body: {} });
    expect((await again.json()).error.code).toBe("lookup_key_taken");
  });

  test("only from test mode", async () => {
    const { dash } = await dashboardHarness();
    const product = await (await dash("/v1/products", { body: PRODUCT, mode: "live" })).json();
    const res = await dash(`/products/${product.id}/copy-to-live`, { body: {}, mode: "live" });
    expect([res.status, (await res.json()).error.code]).toEqual([400, "mode_invalid"]);
  });
});
