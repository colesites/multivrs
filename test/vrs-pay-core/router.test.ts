/**
 * @vrs-pay/core routing — one API in front, the right provider per payment.
 */
import { describe, expect, test } from "bun:test";
import { createProviderRegistry, money, PROVIDER_IDS, routePayment } from "@vrs-pay/core";
import { thrown } from "./helpers";

const ALL = PROVIDER_IDS;

describe("routePayment", () => {
  test("naira cards go to Paystack, with Flutterwave as fallback", () => {
    expect(routePayment({ currency: "NGN", method: "card", enabledProviders: ALL })).toEqual({
      provider: "paystack",
      fallbacks: ["flutterwave"],
    });
  });

  test("pounds and euros go to Stripe first", () => {
    expect(routePayment({ currency: "GBP", method: "card", enabledProviders: ALL })).toEqual({
      provider: "stripe",
      fallbacks: ["flutterwave"],
    });
    expect(routePayment({ currency: "EUR", method: "sepa_debit", enabledProviders: ALL })).toEqual({
      provider: "stripe",
      fallbacks: [],
    });
  });

  test("local methods route to African rails", () => {
    const ussd = routePayment({ currency: "NGN", method: "ussd", enabledProviders: ALL });
    expect(ussd.provider).toBe("paystack");
    const mpesa = routePayment({
      currency: "KES",
      method: "mobile_money",
      enabledProviders: ["flutterwave"],
    });
    expect(mpesa).toEqual({ provider: "flutterwave", fallbacks: [] });
  });

  test("respects only the providers a merchant has enabled", () => {
    const error = thrown(() =>
      routePayment({ currency: "NGN", method: "card", enabledProviders: ["stripe"] }),
    );
    expect(error.code).toBe("no_provider_available");
    expect(error.status).toBe(400);
  });

  test("a merchant preference overrides the default order", () => {
    const decision = routePayment({
      currency: "NGN",
      method: "card",
      enabledProviders: ALL,
      preference: ["flutterwave", "paystack"],
    });
    expect(decision).toEqual({ provider: "flutterwave", fallbacks: ["paystack"] });
  });
});

describe("provider adapter stubs", () => {
  test("report provider_not_implemented until wired up", async () => {
    const registry = createProviderRegistry();
    const attempt = registry.stripe.createCheckout({
      merchantAccountId: "acct_test",
      sessionId: "cs_test",
      amount: money(4900, "GBP"),
      method: "card",
      platformFee: money(50, "GBP"),
      successUrl: "https://example.com/ok",
      cancelUrl: "https://example.com/cancel",
      metadata: {},
      idempotencyKey: "key_1",
    });
    await expect(attempt).rejects.toMatchObject({
      code: "provider_not_implemented",
      status: 501,
    });
  });
});
