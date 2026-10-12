/**
 * vrs-pay-api — the conversion fee: Stripe payments in a currency the
 * platform account doesn't hold cost 2% more; held currencies and the local
 * currencies Paystack settles don't.
 */
import { describe, expect, test } from "bun:test";
import { money, platformFee } from "@vrs-pay/core";
import { createApp } from "../../apps/vrs-pay-api/src/app";
import { settlementCurrenciesFrom } from "../../apps/vrs-pay-api/src/deps/stripe-modes";
import { dashboardHarness } from "./dashboard-harness";
import { GBP_SESSION, harness } from "./harness";

const sessionIn = (currency: string, amount: number) => ({ ...GBP_SESSION, currency, amount });

async function create(app: ReturnType<typeof createApp>, key: string, body: object) {
  const res = await app.request("/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

describe("conversion fee", () => {
  test("Stripe payments in a currency the account doesn't hold cost 2% more", async () => {
    const { app, key } = await harness();
    const gbp = await create(app, key, GBP_SESSION);
    const usd = await create(app, key, sessionIn("usd", 4900));
    expect(gbp.platform_fee).toBe(platformFee(money(4900, "GBP"), 500).amount);
    expect([usd.provider, usd.platform_fee]).toEqual([
      "stripe",
      platformFee(money(4900, "USD"), 700).amount,
    ]);
  });

  test("currencies the account holds, and Paystack's local ones, don't", async () => {
    const h = await harness();
    const app = createApp({ ...h.deps, settlementCurrencies: ["GBP", "USD"] });
    const usd = await create(app, h.key, sessionIn("usd", 4900));
    const eur = await create(app, h.key, sessionIn("eur", 4900));
    const ngn = await create(app, h.key, sessionIn("ngn", 500000));
    expect(usd.platform_fee).toBe(platformFee(money(4900, "USD"), 500).amount);
    expect(eur.platform_fee).toBe(platformFee(money(4900, "EUR"), 700).amount);
    expect([ngn.provider, ngn.platform_fee]).toEqual([
      "paystack",
      platformFee(money(500000, "NGN"), 500).amount,
    ]);
  });

  test("the dashboard shows which currencies carry it", async () => {
    const { dash } = await dashboardHarness();
    const { merchant } = await (await dash("/me")).json();
    expect(merchant.conversion_fee_bps).toBe(200);
    expect(merchant.converted_currencies).toEqual(expect.arrayContaining(["USD", "EUR"]));
    expect(merchant.converted_currencies).not.toContain("GBP");
    expect(merchant.converted_currencies).not.toContain("NGN");
  });

  test("STRIPE_SETTLEMENT_CURRENCIES lists the held currencies, GBP by default", () => {
    expect(settlementCurrenciesFrom(undefined)).toEqual(["GBP"]);
    expect(settlementCurrenciesFrom(" ")).toEqual(["GBP"]);
    expect(settlementCurrenciesFrom("gbp, usd,EUR")).toEqual(["GBP", "USD", "EUR"]);
    expect(() => settlementCurrenciesFrom("GBP,XYZ")).toThrow("XYZ");
  });
});
