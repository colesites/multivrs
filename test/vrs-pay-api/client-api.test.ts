/**
 * vrs-pay-api — /client/v1, the browser API behind @vrs-pay/js and
 * @vrs-pay/react: public pricing with a publishable key, and a customer's
 * own subscriptions, checkout and portal actions with their session.
 */
import { describe, expect, test } from "bun:test";
import { subscribed } from "./billing-flows";

const OK = { success_url: "https://app.test/ok", cancel_url: "https://app.test/no" };

async function setUp() {
  const h = await subscribed("pro");
  const session = await (
    await h.call("/v1/customer_sessions", { body: { customer: h.customer.id } })
  ).json();
  const client = (
    path: string,
    init: { body?: unknown; secret?: string | null; key?: string } = {},
  ) =>
    h.app.request(`/client/v1${path}`, {
      method: init.body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${init.key ?? h.publishableKey}`,
        "Content-Type": "application/json",
        ...(init.secret === null
          ? {}
          : { "VRS-Customer-Session": init.secret ?? session.client_secret }),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  return { ...h, client, secret: session.client_secret as string };
}

describe("browser API", () => {
  test("pricing is public with a publishable key; secret keys and no key are refused", async () => {
    const { client, key } = await setUp();
    const pricing = await (await client("/pricing", { secret: null })).json();
    expect(pricing.data.map((p: { name: string }) => p.name)).toContain("Pro");
    expect(pricing.data[0]).not.toHaveProperty("metadata");
    expect((await client("/pricing", { secret: null, key })).status).toBe(401);
    const none = await client("/pricing", { secret: null, key: "nope" });
    expect(none.status).toBe(401);
  });

  test("browsers may call it from any site", async () => {
    const { app } = await setUp();
    const preflight = await app.request("/client/v1/pricing", {
      method: "OPTIONS",
      headers: {
        Origin: "https://shop.test",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization,vrs-customer-session",
      },
    });
    expect(preflight.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  test("a customer session shows that customer's subscriptions and entitlements", async () => {
    const { client, subscription } = await setUp();
    const overview = await (await client("/customer")).json();
    expect(overview).toMatchObject({
      object: "customer_overview",
      customer: { email: "ada@shop.test" },
      subscriptions: [{ id: subscription.id, status: "active", product_name: "Pro" }],
      entitlements: { features: { custom_domains: true, seats: 5 } },
    });
    const gate = await (await client("/entitlements?feature=custom_domains")).json();
    expect(gate.granted).toBe(true);
    const anonymous = await client("/customer", { secret: null });
    expect((await anonymous.json()).error.code).toBe("customer_session_required");
    const forged = await client("/customer", { secret: "cus_sess_secret_nope" });
    expect(forged.status).toBe(401);
  });

  test("the customer can check out, cancel and resume their own subscription only", async () => {
    const { call, client, priceOf, subscription } = await setUp();
    const checkout = await (
      await client("/checkout", { body: { price: priceOf("basic"), ...OK } })
    ).json();
    expect(checkout.url).toMatch(/^https:\/\/checkout\.stripe\.test\//);
    const canceled = await (
      await client(`/subscriptions/${subscription.id}/cancel`, { body: {} })
    ).json();
    expect(canceled.cancel_at_period_end).toBe(true);
    const resumed = await (
      await client(`/subscriptions/${subscription.id}/resume`, { body: {} })
    ).json();
    expect(resumed.cancel_at_period_end).toBe(false);

    const other = await (
      await call("/v1/customers", { body: { external_id: "user_2", email: "bo@shop.test" } })
    ).json();
    const otherSession = await (
      await call("/v1/customer_sessions", { body: { customer: other.id } })
    ).json();
    const notTheirs = await client(`/subscriptions/${subscription.id}/cancel`, {
      body: {},
      secret: otherSession.client_secret,
    });
    expect(notTheirs.status).toBe(404);
  });
});
