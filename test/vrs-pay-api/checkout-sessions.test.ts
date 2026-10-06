/**
 * vrs-pay-api — POST/GET /v1/checkout/sessions: validation, routing, fees,
 * idempotency and merchant scoping.
 */
import { describe, expect, test } from "bun:test";
import { GBP_SESSION, harness } from "./harness";

describe("POST /v1/checkout/sessions", () => {
  test("pounds route to Stripe with our fee taken", async () => {
    const { call, stripe } = await harness();
    const res = await call("/v1/checkout/sessions", { body: GBP_SESSION });
    expect(res.status).toBe(200);
    const session = await res.json();
    expect(session).toMatchObject({
      object: "checkout.session",
      livemode: false,
      status: "open",
      amount: 4900,
      currency: "gbp",
      payment_method: "card",
      provider: "stripe",
      platform_fee: 73,
    });
    expect(session.id).toMatch(/^cs_/);
    expect(session.url).toBe(`https://pay.test/stripe/${session.id}`);
    expect(stripe.calls[0]?.merchantAccountId).toBe("acct_1");
    expect(stripe.calls[0]?.platformFee).toEqual({ amount: 73, currency: "GBP" });
  });

  test("naira bank transfers route to Paystack", async () => {
    const { call } = await harness();
    const body = {
      ...GBP_SESSION,
      amount: 1500000,
      currency: "ngn",
      payment_method: "bank_transfer",
    };
    const session = await (await call("/v1/checkout/sessions", { body })).json();
    expect(session.provider).toBe("paystack");
  });

  test("invalid input is a 400 naming the bad parameter", async () => {
    const { call } = await harness();
    const cases: Array<[unknown, string, string | null]> = [
      [{ ...GBP_SESSION, amount: 49.99 }, "parameter_invalid", "amount"],
      [{ ...GBP_SESSION, success_url: "javascript:alert(1)" }, "parameter_invalid", "success_url"],
      [{ ...GBP_SESSION, currency: "xyz" }, "parameter_invalid", "currency"],
      [{ ...GBP_SESSION, surprise: true }, "parameter_invalid", null],
      ["{not json", "invalid_json", null],
      [
        { ...GBP_SESSION, currency: "jpy", payment_method: "ussd" },
        "no_provider_available",
        "payment_method",
      ],
    ];
    for (const [body, code, param] of cases) {
      const res = await call("/v1/checkout/sessions", { body });
      expect(res.status).toBe(400);
      const { error } = await res.json();
      expect(error.code).toBe(code);
      if (param) expect(error.param).toBe(param);
    }
  });

  test("an unwired provider is a 501 that names it", async () => {
    const { call } = await harness({ realAdapters: true });
    const res = await call("/v1/checkout/sessions", { body: GBP_SESSION });
    expect(res.status).toBe(501);
    const { error } = await res.json();
    expect(error).toMatchObject({ type: "provider_error", code: "provider_not_implemented" });
    expect(error.details.provider).toBe("stripe");
  });
});

describe("idempotency", () => {
  test("a retry with the same key replays instead of charging twice", async () => {
    const { call, stripe } = await harness();
    const headers = { "Idempotency-Key": "order_42" };
    const first = await call("/v1/checkout/sessions", { body: GBP_SESSION, headers });
    const second = await call("/v1/checkout/sessions", { body: GBP_SESSION, headers });
    expect(second.headers.get("Idempotent-Replayed")).toBe("true");
    expect((await second.json()).id).toBe((await first.json()).id);
    expect(stripe.calls).toHaveLength(1);
    expect(stripe.calls[0]?.idempotencyKey).toBe("order_42");
  });

  test("reusing a key for a different request is a 409", async () => {
    const { call } = await harness();
    const headers = { "Idempotency-Key": "order_43" };
    await call("/v1/checkout/sessions", { body: GBP_SESSION, headers });
    const res = await call("/v1/checkout/sessions", {
      body: { ...GBP_SESSION, amount: 100 },
      headers,
    });
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe("idempotency_key_reused");
  });

  test("a server-side failure frees the key so the retry runs again", async () => {
    const { call } = await harness({ realAdapters: true });
    const headers = { "Idempotency-Key": "order_44" };
    expect((await call("/v1/checkout/sessions", { body: GBP_SESSION, headers })).status).toBe(501);
    expect((await call("/v1/checkout/sessions", { body: GBP_SESSION, headers })).status).toBe(501);
  });
});

describe("GET /v1/checkout/sessions/:id", () => {
  test("returns your session and hides other merchants' sessions", async () => {
    const { call, otherKey } = await harness();
    const created = await (await call("/v1/checkout/sessions", { body: GBP_SESSION })).json();
    const mine = await call(`/v1/checkout/sessions/${created.id}`);
    expect(mine.status).toBe(200);
    expect(await mine.json()).toEqual(created);
    const theirs = await call(`/v1/checkout/sessions/${created.id}`, { key: otherKey });
    expect(theirs.status).toBe(404);
    expect((await theirs.json()).error.code).toBe("resource_missing");
  });
});
