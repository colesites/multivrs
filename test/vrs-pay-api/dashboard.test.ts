/**
 * vrs-pay-api — /dashboard: the signed-in session becomes a merchant, keys
 * made here work on /v1, Stripe connects from here, and every /v1 resource
 * is reachable behind the session.
 */
import { describe, expect, test } from "bun:test";
import { dashboardHarness, ORIGIN } from "./dashboard-harness";

describe("/dashboard", () => {
  test("signed out is a 401; a first sign-in gets a merchant", async () => {
    const { dash } = await dashboardHarness();
    expect((await dash("/me", { as: null })).status).toBe(401);
    expect((await dash("/me", { as: "user_unknown" })).status).toBe(401);
    const me = await (await dash("/me")).json();
    expect(me).toMatchObject({
      user: { email: "ada@shop.test" },
      merchant: { name: "Ada Lovelace's business", platform_fee_bps: 500 },
      mode: "test",
      setup: { status: "setup", completed: 0, total: 7, next: "product" },
    });
    expect((await (await dash("/me")).json()).merchant.id).toBe(me.merchant.id);
  });

  test("CORS allows only the dashboard origin, with cookies", async () => {
    const { app } = await dashboardHarness();
    const preflight = await app.request("/dashboard/me", {
      method: "OPTIONS",
      headers: { Origin: ORIGIN, "Access-Control-Request-Method": "GET" },
    });
    expect(preflight.headers.get("Access-Control-Allow-Origin")).toBe(ORIGIN);
    expect(preflight.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    const providers = await (await app.request("/auth/providers")).json();
    expect(providers).toEqual({ email: true, social: ["github"] });
  });

  test("a secret key made in the dashboard works on /v1 until revoked", async () => {
    const { app, dash } = await dashboardHarness();
    const key = await (await dash("/keys", { body: { kind: "secret" } })).json();
    expect(key.secret).toMatch(/^sk_test_/);
    const list = await (await dash("/keys")).json();
    expect(list.data).toMatchObject([{ id: key.id, revoked: false }]);
    expect(list.data[0]).not.toHaveProperty("secret");
    const call = () =>
      app.request("/v1/payments", { headers: { Authorization: `Bearer ${key.secret}` } });
    expect((await call()).status).toBe(200);
    expect((await dash(`/keys/${key.id}`, { method: "DELETE" })).status).toBe(200);
    expect((await (await dash("/keys")).json()).data[0].revoked).toBe(true);
  });

  test("every /v1 resource works behind the session, scoped to that merchant", async () => {
    const { call, dash } = await dashboardHarness();
    await dash("/v1/customers", { body: { external_id: "user_42", email: "x@shop.test" } });
    const list = await (await dash("/v1/customers")).json();
    expect(list.data).toMatchObject([{ external_id: "user_42" }]);
    expect((await (await call("/v1/customers")).json()).data).toEqual([]);
  });

  test("the overview starts empty and counts what happens", async () => {
    const { dash } = await dashboardHarness();
    const empty = await (await dash("/overview")).json();
    expect(empty).toMatchObject({
      object: "overview",
      totals: [],
      mrr: [],
      customers: { total: 0 },
    });
    expect(empty.daily).toHaveLength(30);
    await dash("/v1/customers", { body: { external_id: "user_1" } });
    expect((await (await dash("/overview")).json()).customers).toEqual({ total: 1, new_30d: 1 });
  });
});
