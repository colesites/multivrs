/**
 * vrs-pay-api — Stripe webhook parsing: signature checks and mapping
 * Stripe events to the few things VRS Pay acts on.
 */
import { describe, expect, test } from "bun:test";
import { isVrsPayError } from "@vrs-pay/core";
import { createStripeProvider } from "../../apps/vrs-pay-api/src/providers/stripe/stripe.provider";
import { fakeStripeApi, WEBHOOK_SECRET } from "./stripe-fakes";
import { checkoutCompleted, signedStripeRequest, stripeEvent } from "./stripe-fixtures";

async function parse(event: object, secrets = [WEBHOOK_SECRET]) {
  const { api } = fakeStripeApi();
  const provider = createStripeProvider({ api, webhookSecrets: secrets });
  const request = await signedStripeRequest(event);
  return provider.parseWebhook({ rawBody: request.body, headers: new Headers(request.headers) });
}

describe("Stripe webhook parsing", () => {
  test("a paid checkout maps to checkout.completed with the fees Stripe took", async () => {
    const event = await parse(
      stripeEvent("checkout.session.completed", checkoutCompleted("cs_test_1", "cs_vrs123")),
    );
    expect(event).toMatchObject({
      type: "checkout.completed",
      account: null,
      data: {
        sessionReference: "cs_test_1",
        sessionId: "cs_vrs123",
        paymentReference: "pi_for_cs_test_1",
        amount: { amount: 4900, currency: "GBP" },
        platformFee: { amount: 73, currency: "GBP" },
        providerFee: { amount: 94, currency: "GBP" },
        customerEmail: "buyer@shop.test",
      },
    });
  });

  test("unpaid checkouts, refunds and accounts map as expected", async () => {
    const unpaid = { ...checkoutCompleted("cs_test_1", "cs_vrs"), payment_status: "unpaid" };
    expect((await parse(stripeEvent("checkout.session.completed", unpaid))).type).toBe("ignored");
    const refund = {
      id: "re_1",
      amount: 500,
      currency: "gbp",
      status: "succeeded",
      payment_intent: "pi_1",
      metadata: {},
    };
    expect(await parse(stripeEvent("refund.updated", refund))).toMatchObject({
      type: "refund.updated",
      data: {
        refundReference: "re_1",
        refundId: null,
        status: "succeeded",
        amount: { amount: 500 },
      },
    });
    const account = {
      id: "acct_1",
      charges_enabled: true,
      payouts_enabled: false,
      details_submitted: true,
    };
    expect((await parse(stripeEvent("account.updated", account))).data).toEqual({
      accountId: "acct_1",
      chargesEnabled: true,
      payoutsEnabled: false,
      detailsSubmitted: true,
    });
    expect((await parse(stripeEvent("customer.created", {}))).type).toBe("ignored");
  });

  test("signatures: a second secret is tried, a wrong one is a 400", async () => {
    const event = stripeEvent("customer.created", {});
    expect((await parse(event, ["whsec_other", WEBHOOK_SECRET])).type).toBe("ignored");
    const error = await parse(event, ["whsec_other"]).catch((e) => e);
    expect(isVrsPayError(error) && [error.status, error.code]).toEqual([400, "signature_invalid"]);
  });
});
