/**
 * vrs-pay-api — /v1/customers and /v1/customer_sessions: users and orgs
 * keyed by the merchant's own ids, and browser-safe sessions.
 */
import { describe, expect, test } from "bun:test";
import { sha256Hex } from "@vrs-pay/core";
import { harness } from "./harness";

describe("/v1/customers", () => {
  test("create, read, look up by external id and update", async () => {
    const { call } = await harness();
    const body = { external_id: "org_42", type: "org", email: "team@acme.test", name: "Acme" };
    const created = await (await call("/v1/customers", { body })).json();
    expect(created).toMatchObject({
      object: "customer",
      external_id: "org_42",
      type: "org",
      livemode: false,
    });
    expect(created.id).toMatch(/^cus_/);
    expect((await (await call(`/v1/customers/${created.id}`)).json()).name).toBe("Acme");
    expect((await (await call("/v1/customers?external_id=org_42")).json()).id).toBe(created.id);
    const updated = await (
      await call(`/v1/customers/${created.id}`, {
        body: { name: null, metadata: { tier: "gold" } },
      })
    ).json();
    expect(updated).toMatchObject({
      name: null,
      email: "team@acme.test",
      metadata: { tier: "gold" },
    });
  });

  test("an external id can only be used once per merchant", async () => {
    const { call, otherKey } = await harness();
    await call("/v1/customers", { body: { external_id: "user_1" } });
    const dup = await call("/v1/customers", { body: { external_id: "user_1" } });
    expect([dup.status, (await dup.json()).error.code]).toEqual([400, "resource_already_exists"]);
    expect(
      (await call("/v1/customers", { body: { external_id: "user_1" }, key: otherKey })).status,
    ).toBe(200);
  });

  test("other merchants can't see the customer", async () => {
    const { call, otherKey } = await harness();
    const created = await (await call("/v1/customers", { body: { external_id: "user_1" } })).json();
    expect((await call(`/v1/customers/${created.id}`, { key: otherKey })).status).toBe(404);
    expect((await call("/v1/customers?external_id=user_1", { key: otherKey })).status).toBe(404);
  });
});

describe("/v1/customer_sessions", () => {
  test("by external id: the customer is created on first use, then reused", async () => {
    const { call, deps } = await harness();
    const body = { external_id: "user_7", email: "ada@shop.test" };
    const first = await (await call("/v1/customer_sessions", { body })).json();
    expect(first).toMatchObject({
      object: "customer_session",
      customer: { external_id: "user_7", email: "ada@shop.test" },
    });
    expect(first.client_secret).toMatch(new RegExp(`^${first.id}_secret_[0-9A-Za-z]{32}$`));
    expect(first.expires_at - Math.floor(Date.now() / 1000)).toBeGreaterThan(29 * 60);
    const second = await (await call("/v1/customer_sessions", { body })).json();
    expect(second.customer.id).toBe(first.customer.id);
    expect(second.client_secret).not.toBe(first.client_secret);

    const found = await deps.customers.findBySession(
      await sha256Hex(first.client_secret),
      new Date(),
    );
    expect(found?.customer.id).toBe(first.customer.id);
    const later = new Date((first.expires_at + 1) * 1000);
    expect(
      await deps.customers.findBySession(await sha256Hex(first.client_secret), later),
    ).toBeNull();
  });

  test("by customer id, and exactly one of customer / external_id", async () => {
    const { call } = await harness();
    const customer = await (
      await call("/v1/customers", { body: { external_id: "user_9" } })
    ).json();
    expect(
      (await (await call("/v1/customer_sessions", { body: { customer: customer.id } })).json())
        .customer.id,
    ).toBe(customer.id);
    for (const body of [{}, { customer: customer.id, external_id: "user_9" }]) {
      const res = await call("/v1/customer_sessions", { body });
      expect([res.status, (await res.json()).error.param]).toEqual([400, "customer"]);
    }
  });
});
