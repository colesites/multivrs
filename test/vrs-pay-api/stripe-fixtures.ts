import { WEBHOOK_SECRET, webhookSdk } from "./stripe-fakes";

/** A Stripe-signed webhook request for `event`. */
export async function signedStripeRequest(event: object, secret = WEBHOOK_SECRET) {
  const body = JSON.stringify(event);
  const signature = await webhookSdk.webhooks.generateTestHeaderStringAsync({
    payload: body,
    secret,
  });
  return {
    method: "POST",
    body,
    headers: { "Stripe-Signature": signature, "Content-Type": "application/json" },
  };
}

let eventCounter = 0;

/** An event shaped like Stripe sends it: from the platform account, or a connected `account`. */
export function stripeEvent(type: string, object: object, account: string | null = null) {
  eventCounter += 1;
  return {
    id: `evt_test_${eventCounter}`,
    object: "event",
    type,
    account,
    created: Math.floor(Date.now() / 1000),
    data: { object },
  };
}

export function checkoutCompleted(sessionReference: string, sessionId: string, amount = 4900) {
  return {
    id: sessionReference,
    object: "checkout.session",
    mode: "payment",
    payment_status: "paid",
    payment_intent: `pi_for_${sessionReference}`,
    amount_total: amount,
    currency: "gbp",
    customer: "cus_stripe_1",
    client_reference_id: sessionId,
    metadata: { vrs_session_id: sessionId },
    customer_details: { email: "buyer@shop.test" },
  };
}

/** A setup-mode checkout (trial start) that saved a card. */
export function setupCompleted(sessionReference: string, sessionId: string) {
  return {
    id: sessionReference,
    object: "checkout.session",
    mode: "setup",
    setup_intent: `seti_for_${sessionReference}`,
    customer: "cus_stripe_1",
    client_reference_id: sessionId,
    metadata: { vrs_session_id: sessionId },
  };
}
