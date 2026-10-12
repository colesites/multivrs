/**
 * vrs-pay-api — Paystack: NGN checkouts route to it, the hosted page asks for
 * the buyer's email when the merchant didn't send one, signed webhooks record
 * payments and refunds, and saved cards renew subscriptions.
 */
import { describe, expect, test } from "bun:test";
import { money } from "@vrs-pay/core";
import { createApp } from "../../apps/vrs-pay-api/src/app";
import { createPaystackProvider } from "../../apps/vrs-pay-api/src/providers/paystack/paystack.provider";
import { chargeableCurrencies } from "../../apps/vrs-pay-api/src/services/platform";
import { harness } from "./harness";
import {
  chargeSuccess,
  type FakePaystackOptions,
  fakePaystackApi,
  PAYSTACK_SECRET,
  refundEvent,
  signedPaystackRequest,
} from "./paystack-fakes";

const NGN_SESSION = {
  amount: 500000,
  currency: "ngn",
  success_url: "https://shop.test/thanks",
  cancel_url: "https://shop.test/cart",
};

async function paystackSetup(options: FakePaystackOptions = {}) {
  const paystack = fakePaystackApi(options);
  const h = await harness({ paystackApi: paystack.api });
  const deliver = async (payload: object, secret = PAYSTACK_SECRET) =>
    h.app.request("/webhooks/paystack", signedPaystackRequest(payload, secret));
  return { ...h, paystackApi: paystack, deliver };
}

describe("Paystack checkout", () => {
  test("an NGN checkout with an email goes straight to Paystack's page", async () => {
    const { call, paystackApi } = await paystackSetup();
    const res = await call("/v1/checkout/sessions", {
      body: { ...NGN_SESSION, customer_email: "ada@shop.test" },
    });
    expect(res.status).toBe(200);
    const session = await res.json();
    expect(session).toMatchObject({ provider: "paystack", provider_reference: session.id });
    expect(session.url).toMatch(/^https:\/\/checkout\.paystack\.com\//);
    const [init] = paystackApi.calls;
    expect(init).toMatchObject({
      method: "POST",
      path: "/transaction/initialize",
      body: {
        email: "ada@shop.test",
        amount: 500000,
        currency: "NGN",
        reference: session.id,
        callback_url: "https://shop.test/thanks",
        channels: ["card"],
        metadata: { vrs_session_id: session.id, cancel_action: "https://shop.test/cart" },
      },
    });
  });

  test("without an email, our page asks for one, then starts the payment once", async () => {
    const { app, call, paystackApi } = await paystackSetup();
    const session = await (await call("/v1/checkout/sessions", { body: NGN_SESSION })).json();
    expect(session.url).toBe(`https://vrs.test/pay/${session.id}`);
    expect(paystackApi.calls).toHaveLength(0);

    const page = await (await app.request(`/l/session/${session.id}`)).json();
    expect(page).toMatchObject({ provider: "paystack", needs_email: true, checkout_url: null });

    const start = (email: string) =>
      app.request(`/l/session/${session.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    expect((await start("not-an-email")).status).toBe(400);
    const started = await (await start("ada@shop.test")).json();
    expect(started.url).toMatch(/^https:\/\/checkout\.paystack\.com\//);
    expect(paystackApi.calls[0]?.body).toMatchObject({
      email: "ada@shop.test",
      reference: session.id,
    });

    // Starting again (a refresh, a double click) reuses the same page.
    expect((await (await start("ada@shop.test")).json()).url).toBe(started.url);
    expect(paystackApi.calls).toHaveLength(1);
    const after = await (await app.request(`/l/session/${session.id}`)).json();
    expect(after).toMatchObject({
      needs_email: false,
      checkout_url: started.url,
      customer_email: "ada@shop.test",
    });
  });

  test("USD still goes to Stripe, and the start endpoint refuses Stripe checkouts", async () => {
    const { app, call, paystackApi } = await paystackSetup();
    const session = await (
      await call("/v1/checkout/sessions", {
        body: { ...NGN_SESSION, currency: "usd", amount: 4900 },
      })
    ).json();
    expect(session.provider).toBe("stripe");
    const res = await app.request(`/l/session/${session.id}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ada@shop.test" }),
    });
    expect((await res.json()).error.code).toBe("not_needed");
    expect(paystackApi.calls).toHaveLength(0);
  });
});

describe("Paystack account currencies", () => {
  test("a Nigerian account takes NGN only: cedi checkouts aren't sent to it", async () => {
    const h = await harness();
    const nigerian = { ...h.deps.modes.test, currencies: { paystack: ["NGN"] as const } };
    const deps = {
      ...h.deps,
      modes: { test: nigerian, live: { ...h.deps.modes.live, currencies: nigerian.currencies } },
    };
    const app = createApp(deps);
    const create = (currency: string, amount: number) =>
      app.request("/v1/checkout/sessions", {
        method: "POST",
        headers: { Authorization: `Bearer ${h.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...NGN_SESSION, currency, amount }),
      });
    expect((await (await create("ngn", 500000)).json()).provider).toBe("paystack");
    const ghs = await (await create("ghs", 50000)).json();
    expect(ghs.provider).not.toBe("paystack");
    expect(h.paystack.calls.map((c) => c.amount.currency)).toEqual(["NGN"]);
    expect(chargeableCurrencies(deps)).toContain("NGN");
  });
});

describe("Paystack webhooks", () => {
  test("charge.success records the payment with Paystack's fee, once", async () => {
    const { call, deliver, state } = await paystackSetup();
    const session = await (
      await call("/v1/checkout/sessions", {
        body: { ...NGN_SESSION, customer_email: "ada@shop.test" },
      })
    ).json();
    const event = chargeSuccess(session.id, 500000, { metadata: { vrs_session_id: session.id } });
    const res = await deliver(event);
    expect(res.status).toBe(200);
    expect((await res.json()).outcome).toBe("processed");
    const [stored] = [...state.payments.values()];
    expect(stored?.payment).toMatchObject({
      status: "succeeded",
      amount: 500000,
      currency: "ngn",
      provider: "paystack",
      provider_reference: session.id,
      provider_fee: 7500,
    });
    expect((await (await call(`/v1/checkout/sessions/${session.id}`)).json()).status).toBe(
      "complete",
    );
    expect((await (await deliver(event)).json()).outcome).toBe("duplicate");
    expect(state.payments.size).toBe(1);
  });

  test("a bad signature is rejected; events we don't use are acknowledged", async () => {
    const { call, deliver, state } = await paystackSetup();
    const session = await (await call("/v1/checkout/sessions", { body: NGN_SESSION })).json();
    const forged = await deliver(chargeSuccess(session.id, 500000), "sk_test_someone_else");
    expect([forged.status, (await forged.json()).error.code]).toEqual([400, "signature_invalid"]);
    expect(state.payments.size).toBe(0);

    const transfer = { event: "transfer.success", data: { id: 1, amount: 100, currency: "NGN" } };
    expect((await (await deliver(transfer)).json()).outcome).toBe("ignored");
  });

  test("a refund stays pending until refund.processed settles it", async () => {
    const { call, deliver, state, paystackApi } = await paystackSetup();
    const session = await (
      await call("/v1/checkout/sessions", {
        body: { ...NGN_SESSION, customer_email: "ada@shop.test" },
      })
    ).json();
    await deliver(chargeSuccess(session.id, 500000));
    const [stored] = [...state.payments.values()];
    const paymentId = stored?.payment.id;

    const refund = await (
      await call("/v1/refunds", { body: { payment: paymentId, amount: 200000 } })
    ).json();
    expect(refund).toMatchObject({ status: "pending", amount: 200000 });
    expect(paystackApi.calls.at(-1)).toMatchObject({
      path: "/refund",
      body: { transaction: session.id, amount: 200000 },
    });

    const processed = await deliver(refundEvent("refund.processed", session.id, 200000));
    expect((await processed.json()).outcome).toBe("processed");
    expect((await (await call(`/v1/refunds/${refund.id}`)).json()).status).toBe("succeeded");
    const payment = await (await call(`/v1/payments/${paymentId}`)).json();
    expect(payment).toMatchObject({ status: "partially_refunded", amount_refunded: 200000 });
  });
});

describe("Paystack saved-card charges", () => {
  async function charge(options: FakePaystackOptions) {
    const paystack = fakePaystackApi(options);
    const provider = createPaystackProvider({ api: paystack.api, secretKey: PAYSTACK_SECRET });
    const { reference: customer } = await provider.ensureCustomer({
      merchantAccountId: null,
      customerId: "cus_1",
      email: "ada@shop.test",
      name: "Ada Obi",
      idempotencyKey: "k",
    });
    const result = await provider.chargeSaved({
      merchantAccountId: null,
      providerCustomer: customer,
      methodRef: "AUTH_8dfhjjdt",
      amount: money(500000, "NGN"),
      platformFee: money(0, "NGN"),
      description: "Pro · monthly",
      metadata: {},
      idempotencyKey: "inv_1-attempt",
    });
    return { result, calls: paystack.calls };
  }

  test("a renewal charges the card with the customer's email and keeps the fee", async () => {
    const { result, calls } = await charge({});
    expect(result).toMatchObject({
      status: "succeeded",
      reference: "inv_1-attempt",
      providerFee: { amount: 7500, currency: "NGN" },
    });
    expect(calls.find((c) => c.path === "/transaction/charge_authorization")?.body).toMatchObject({
      authorization_code: "AUTH_8dfhjjdt",
      email: "ada@shop.test",
      amount: 500000,
      currency: "NGN",
      reference: "inv_1-attempt",
    });
  });

  test("declines, bank approval, network failures and retries map to the right outcome", async () => {
    expect((await charge({ charge: "failed" })).result).toMatchObject({
      status: "declined",
      message: "Insufficient Funds",
    });
    expect((await charge({ charge: "paused" })).result.status).toBe("requires_action");
    expect((await charge({ charge: "network" })).result.status).toBe("error");
    // The same reference again: Paystack refuses, so we ask how the first try ended.
    const retried = await charge({ charge: "duplicate" });
    expect(retried.result).toMatchObject({ status: "succeeded", reference: "inv_1-attempt" });
    expect(retried.calls.at(-1)?.path).toBe("/transaction/verify/inv_1-attempt");
  });

  test("free trials aren't offered, and customers need an email", async () => {
    const provider = createPaystackProvider({
      api: fakePaystackApi().api,
      secretKey: PAYSTACK_SECRET,
    });
    await expect(
      provider.createCheckout({
        merchantAccountId: null,
        sessionId: "cs_1",
        amount: money(0, "NGN"),
        method: "card",
        platformFee: money(0, "NGN"),
        successUrl: "https://s.test/ok",
        cancelUrl: "https://s.test/no",
        metadata: {},
        idempotencyKey: "cs_1",
        mode: "setup",
      }),
    ).rejects.toMatchObject({ code: "trial_unsupported" });
    await expect(
      provider.ensureCustomer({
        merchantAccountId: null,
        customerId: "cus_1",
        email: null,
        name: null,
        idempotencyKey: "k",
      }),
    ).rejects.toMatchObject({ code: "email_required" });
  });
});
