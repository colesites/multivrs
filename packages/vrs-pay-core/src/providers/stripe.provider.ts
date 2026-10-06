import { providerNotImplemented } from "../errors";
import { PROVIDER_CAPABILITIES } from "./capabilities";
import type { PaymentProvider } from "./provider.types";

/**
 * Stripe adapter — Connect direct charges on the merchant's connected
 * account, with an application fee. Implementation notes:
 *
 * - createCheckout → `stripe.checkout.sessions.create({ mode: "payment",
 *   line_items, success_url, cancel_url, metadata, payment_intent_data:
 *   { application_fee_amount: platformFee } }, { stripeAccount:
 *   merchantAccountId, idempotencyKey })`
 * - refund → `stripe.refunds.create({ payment_intent }, { stripeAccount,
 *   idempotencyKey })`
 * - parseWebhook → `stripe.webhooks.constructEventAsync(rawBody,
 *   headers.get("stripe-signature"), connectWebhookSecret)`, then map
 *   `checkout.session.completed` / `charge.refunded` → VRS event types.
 */
export function createStripeProvider(): PaymentProvider {
  return {
    id: "stripe",
    capabilities: PROVIDER_CAPABILITIES.stripe,
    async createCheckout() {
      throw providerNotImplemented("stripe", "createCheckout");
    },
    async refund() {
      throw providerNotImplemented("stripe", "refund");
    },
    async parseWebhook() {
      throw providerNotImplemented("stripe", "parseWebhook");
    },
  };
}
