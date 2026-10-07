import { GBP_SESSION, harness } from "./harness";
import { type FakeStripeOptions, fakeStripeApi } from "./stripe-fakes";
import { checkoutCompleted, signedStripeRequest, stripeEvent } from "./stripe-fixtures";

/**
 * A merchant with a webhook endpoint and an open GBP checkout, plus the
 * signed Stripe event that pays it. `deliver` posts any event to /webhooks/stripe.
 */
export async function paidCheckout(options: FakeStripeOptions = {}) {
  const stripe = fakeStripeApi(options);
  const h = await harness({ stripeApi: stripe.api });
  await h.call("/v1/webhook_endpoints", { body: { url: "https://shop.test/hooks" } });
  const session = await (await h.call("/v1/checkout/sessions", { body: GBP_SESSION })).json();
  const event = stripeEvent(
    "checkout.session.completed",
    checkoutCompleted(session.provider_reference, session.id),
  );
  const deliver = async (e: object) =>
    (await h.app.request("/webhooks/stripe", await signedStripeRequest(e))).json();
  return { ...h, stripeApi: stripe, session, event, deliver };
}

/** As above, with the checkout already paid; returns the payment id. */
export async function paidPayment(options: FakeStripeOptions = {}) {
  const flow = await paidCheckout(options);
  await flow.deliver(flow.event);
  const [stored] = [...flow.state.payments.values()];
  if (!stored) throw new Error("payment was not recorded");
  return {
    ...flow,
    paymentId: stored.payment.id,
    paymentReference: stored.payment.provider_reference,
  };
}
