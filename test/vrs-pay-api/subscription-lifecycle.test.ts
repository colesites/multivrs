/**
 * vrs-pay-api — the billing engine: renewals, failed-payment retries,
 * cancellation, and plan changes with proration.
 */
import { describe, expect, test } from "bun:test";
import { DUNNING_RETRY_DAYS } from "../../apps/vrs-pay-api/src/services/invoice-dunning";
import { subscribed } from "./billing-flows";

const DAY = 86_400;

describe("renewals", () => {
  test("at period end: next period, a new invoice, an off-session charge with our fee", async () => {
    const { call, cycle, stripeApi, subscription } = await subscribed();
    const result = await cycle(subscription.current_period_end + 1);
    expect(result).toMatchObject({ renewed: 1, collected: ["paid"] });
    const after = await (await call(`/v1/subscriptions/${subscription.id}`)).json();
    expect(after.current_period_start).toBe(subscription.current_period_end);
    const invoices = (await (await call(`/v1/invoices?subscription=${subscription.id}`)).json())
      .data;
    expect(invoices.map((i: { status: string }) => i.status)).toEqual(["paid", "paid"]);
    const charge = stripeApi.calls.charges[0];
    expect(charge?.params).toMatchObject({ amount: 900, statement_descriptor_suffix: "Acme Ltd" });
    expect(charge?.params).not.toHaveProperty("application_fee_amount");
    expect(charge?.options?.idempotencyKey).toMatch(/^in_[0-9A-Za-z]{24}-1$/);
    expect(await cycle(subscription.current_period_end + 2)).toMatchObject({
      renewed: 0,
      collected: [],
    });
  });

  test("declines retry on the schedule (past due), then cancel and remove access", async () => {
    const { call, customer, cycle, state, subscription } = await subscribed("pro", {
      charge: "declined",
    });
    let now = subscription.current_period_end + 1;
    expect((await cycle(now)).collected).toEqual(["failed"]);
    expect((await (await call(`/v1/subscriptions/${subscription.id}`)).json()).status).toBe(
      "past_due",
    );
    for (const [i, days] of DUNNING_RETRY_DAYS.entries()) {
      now += days * DAY;
      const expected = i === DUNNING_RETRY_DAYS.length - 1 ? "canceled" : "failed";
      expect((await cycle(now)).collected).toEqual([expected]);
    }
    expect((await (await call(`/v1/subscriptions/${subscription.id}`)).json()).status).toBe(
      "canceled",
    );
    const [, last] = [...state.invoices.values()].map((i) => i.invoice);
    expect(last).toMatchObject({
      status: "uncollectible",
      attempt_count: DUNNING_RETRY_DAYS.length + 1,
    });
    expect((await (await call(`/v1/entitlements?customer=${customer.id}`)).json()).plans).toEqual(
      [],
    );
  });

  test("a past-due subscription recovers when a retry succeeds", async () => {
    const { call, cycle, stripeApi, subscription } = await subscribed("pro", {
      charge: "declined",
    });
    await cycle(subscription.current_period_end + 1);
    stripeApi.options.charge = "succeeded";
    expect((await cycle(subscription.current_period_end + 1 + DAY)).collected).toEqual(["paid"]);
    expect((await (await call(`/v1/subscriptions/${subscription.id}`)).json()).status).toBe(
      "active",
    );
  });

  test("an unknown charge outcome retries later with the same idempotency key", async () => {
    const { cycle, stripeApi, subscription } = await subscribed("pro", { charge: "network" });
    expect((await cycle(subscription.current_period_end + 1)).collected).toEqual(["retry_later"]);
    stripeApi.options.charge = "succeeded";
    expect((await cycle(subscription.current_period_end + 3_700)).collected).toEqual(["paid"]);
    const keys = stripeApi.calls.charges.map((c) => c.options?.idempotencyKey);
    expect(keys[0]).toBe(keys[1]);
  });
});

describe("cancel, resume and plan changes", () => {
  test("cancel at period end keeps access until then; resume undoes it", async () => {
    const { call, cycle, subscription } = await subscribed();
    const canceling = await (
      await call(`/v1/subscriptions/${subscription.id}/cancel`, { body: {} })
    ).json();
    expect(canceling).toMatchObject({ status: "active", cancel_at_period_end: true });
    const resumed = await (
      await call(`/v1/subscriptions/${subscription.id}/resume`, { body: {} })
    ).json();
    expect(resumed.cancel_at_period_end).toBe(false);
    await call(`/v1/subscriptions/${subscription.id}/cancel`, { body: { at: "period_end" } });
    expect((await cycle(subscription.current_period_end + 1)).collected).toEqual([]);
    expect((await (await call(`/v1/subscriptions/${subscription.id}`)).json()).status).toBe(
      "canceled",
    );
  });

  test("an upgrade charges the prorated difference now; a downgrade waits for renewal", async () => {
    const { call, cycle, priceOf, stripeApi, subscription } = await subscribed("basic");
    const upgraded = await (
      await call(`/v1/subscriptions/${subscription.id}`, { body: { price: priceOf("pro") } })
    ).json();
    expect(upgraded.price).toBe(priceOf("pro"));
    const due = stripeApi.calls.charges[0]?.params.amount ?? 0;
    expect(due).toBeGreaterThan(395);
    expect(due).toBeLessThanOrEqual(400);
    const down = await (
      await call(`/v1/subscriptions/${subscription.id}`, { body: { price: priceOf("basic") } })
    ).json();
    expect(down).toMatchObject({ price: priceOf("pro"), pending_price: priceOf("basic") });
    await cycle(subscription.current_period_end + 1);
    const renewed = await (await call(`/v1/subscriptions/${subscription.id}`)).json();
    expect(renewed).toMatchObject({ price: priceOf("basic"), pending_price: null });
    expect(stripeApi.calls.charges[1]?.params.amount).toBe(500);
  });

  test("a declined upgrade is a 402 and changes nothing", async () => {
    const { call, priceOf, stripeApi, subscription } = await subscribed("basic");
    stripeApi.options.charge = "declined";
    const res = await call(`/v1/subscriptions/${subscription.id}`, {
      body: { price: priceOf("pro") },
    });
    expect([res.status, (await res.json()).error.code]).toEqual([402, "card_declined"]);
    expect((await (await call(`/v1/subscriptions/${subscription.id}`)).json()).price).toBe(
      priceOf("basic"),
    );
  });
});
