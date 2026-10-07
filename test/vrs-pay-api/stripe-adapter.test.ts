/**
 * vrs-pay-api — the Stripe adapter: direct charges on the connected
 * account, refunds and error mapping.
 */
import { describe, expect, test } from "bun:test";
import { isVrsPayError, money, type ProviderCheckoutInput } from "@vrs-pay/core";
import { createStripeProvider } from "../../apps/vrs-pay-api/src/providers/stripe/stripe.provider";
import { fakeStripeApi } from "./stripe-fakes";

const CHECKOUT: ProviderCheckoutInput = {
  merchantAccountId: "acct_1",
  sessionId: "cs_vrs123",
  amount: money(4900, "GBP"),
  method: "apple_pay",
  description: "Pro plan",
  platformFee: money(73, "GBP"),
  successUrl: "https://shop.test/thanks",
  cancelUrl: "https://shop.test/cart",
  metadata: { order: "42" },
  idempotencyKey: "idem_1",
};

describe("Stripe adapter", () => {
  test("checkout is a direct charge on the connected account with our fee", async () => {
    const { api, calls } = fakeStripeApi();
    const checkout = await createStripeProvider({ api, webhookSecrets: [] }).createCheckout(
      CHECKOUT,
    );
    expect(checkout).toEqual({
      provider: "stripe",
      reference: "cs_test_1",
      url: "https://checkout.stripe.test/cs_test_1",
    });
    const [{ params, options } = { params: {} }] = calls.sessions;
    expect(options).toEqual({ stripeAccount: "acct_1", idempotencyKey: "idem_1" });
    expect(params.payment_method_types).toEqual(["card"]);
    expect(params.payment_intent_data?.application_fee_amount).toBe(73);
    expect(params.metadata).toEqual({ order: "42", vrs_session_id: "cs_vrs123" });
    expect(params.line_items?.[0]?.price_data).toMatchObject({
      currency: "gbp",
      unit_amount: 4900,
    });
  });

  test("a zero fee sends no application fee at all", async () => {
    const { api, calls } = fakeStripeApi();
    const provider = createStripeProvider({ api, webhookSecrets: [] });
    await provider.createCheckout({ ...CHECKOUT, platformFee: money(0, "GBP") });
    expect(calls.sessions[0]?.params.payment_intent_data).not.toHaveProperty(
      "application_fee_amount",
    );
  });

  test("refunds carry our id and map Stripe's status", async () => {
    const { api, calls } = fakeStripeApi({ refundStatus: "pending" });
    const refund = await createStripeProvider({ api, webhookSecrets: [] }).refund({
      merchantAccountId: "acct_1",
      paymentReference: "pi_1",
      amount: money(1000, "GBP"),
      refundId: "re_vrs1",
      idempotencyKey: "re_vrs1",
    });
    expect(refund).toEqual({ provider: "stripe", reference: "re_stripe_1", status: "pending" });
    expect(calls.refunds[0]?.params).toMatchObject({
      payment_intent: "pi_1",
      amount: 1000,
      metadata: { vrs_refund_id: "re_vrs1" },
    });
    expect(calls.refunds[0]?.options).toEqual({
      stripeAccount: "acct_1",
      idempotencyKey: "re_vrs1",
    });
  });

  test("SDK failures become a 502, flagged retryable for network errors", async () => {
    const outage = Object.assign(new Error("socket hang up"), { type: "StripeConnectionError" });
    const { api } = fakeStripeApi({ failWith: outage });
    const error = await createStripeProvider({ api, webhookSecrets: [] })
      .createCheckout(CHECKOUT)
      .catch((e) => e);
    expect(isVrsPayError(error) && error.status).toBe(502);
    expect(isVrsPayError(error) && error.details).toMatchObject({ retryable: true });
  });
});
