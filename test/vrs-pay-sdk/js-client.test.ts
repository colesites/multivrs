/**
 * @vrs-pay/js — the browser client against the real API app: public
 * pricing, the customer's own portal actions, feature checks and a session
 * refreshed once when it expires.
 */
import { describe, expect, test } from "bun:test";
import {
  createVrsPayClient,
  formatAmount,
  formatPrice,
  type PricingPrice,
  VrsPayError,
} from "../../packages/vrs-pay-js/src/index";
import { subscribed } from "../vrs-pay-api/billing-flows";

const API_URL = "http://vrs.test/";
const URLS = { successUrl: "https://app.test/ok", cancelUrl: "https://app.test/no" };

async function setUp() {
  const h = await subscribed("pro");
  const newSecret = async () =>
    (await (await h.call("/v1/customer_sessions", { body: { customer: h.customer.id } })).json())
      .client_secret as string;
  const fetch = async (url: string, init: RequestInit) => h.app.request(url, init);
  const client = (customerSession?: string | (() => Promise<string>)) =>
    createVrsPayClient({
      publishableKey: h.publishableKey,
      apiUrl: API_URL,
      fetch,
      customerSession,
    });
  return { ...h, client, newSecret };
}

describe("createVrsPayClient", () => {
  test("pricing needs only the publishable key; secret keys are refused", async () => {
    const { client, key } = await setUp();
    const products = await client().pricing();
    expect(products.map((p) => p.name)).toContain("Pro");
    expect(() => createVrsPayClient({ publishableKey: key, apiUrl: API_URL })).toThrow(
      /secret key/,
    );
  });

  test("a customer sees their plan and features", async () => {
    const { client, newSecret, subscription } = await setUp();
    const vrs = client(await newSecret());
    const overview = await vrs.customer();
    expect(overview.subscriptions).toMatchObject([{ id: subscription.id, product_name: "Pro" }]);
    expect(await vrs.hasFeature("custom_domains")).toBe(true);
    expect(await vrs.hasFeature("sso")).toBe(false);
    expect((await vrs.entitlements()).features.seats).toBe(5);
  });

  test("without a session, customer pages fail with a clear code", async () => {
    const { client } = await setUp();
    const failure = client().customer();
    await expect(failure).rejects.toBeInstanceOf(VrsPayError);
    await expect(failure).rejects.toMatchObject({ code: "customer_session_required" });
  });

  test("the customer can start checkout, cancel and keep their plan", async () => {
    const { client, newSecret, priceOf, subscription } = await setUp();
    const vrs = client(await newSecret());
    const checkout = await vrs.checkout({ price: priceOf("basic"), ...URLS });
    expect(checkout.url).toMatch(/^https:\/\//);
    await expect(vrs.checkout({ price: priceOf("basic") })).rejects.toThrow(/successUrl/);
    const canceled = await vrs.cancelSubscription(subscription.id);
    expect(canceled).toMatchObject({ status: "active", cancel_at_period_end: true });
    const kept = await vrs.resumeSubscription(subscription.id);
    expect(kept.cancel_at_period_end).toBe(false);
  });

  test("an expired session is fetched again once", async () => {
    const { client, newSecret } = await setUp();
    const handed: string[] = [];
    const vrs = client(async () => {
      const secret = handed.length === 0 ? "cus_sess_secret_expired" : await newSecret();
      handed.push(secret);
      return secret;
    });
    expect((await vrs.customer()).object).toBe("customer_overview");
    expect(handed).toHaveLength(2);
    await vrs.entitlements();
    expect(handed).toHaveLength(2);
  });
});

describe("formatPrice", () => {
  const price: PricingPrice = {
    id: "price_1",
    amount: 900,
    currency: "gbp",
    currency_options: { usd: { amount: 1100 } },
    interval: "month",
    interval_count: 1,
    usage_type: "licensed",
    lookup_key: null,
  };

  test("shows the amount and how often it's charged", () => {
    expect(formatAmount(4900, "gbp", "en-GB")).toBe("£49.00");
    expect(formatPrice(price, undefined, "en-GB")).toBe("£9.00 / month");
    expect(formatPrice({ ...price, interval_count: 3 }, undefined, "en-GB")).toBe(
      "£9.00 every 3 months",
    );
    expect(formatPrice({ ...price, interval: "one_time" }, undefined, "en-GB")).toBe("£9.00");
    expect(formatPrice({ ...price, usage_type: "metered", amount: 10 }, undefined, "en-GB")).toBe(
      "£0.10 per unit / month",
    );
  });

  test("uses another currency when the price is sold in it, else its own", () => {
    expect(formatPrice(price, "usd", "en-US")).toBe("$11.00 / month");
    expect(formatPrice(price, "eur", "en-GB")).toBe("£9.00 / month");
  });
});
