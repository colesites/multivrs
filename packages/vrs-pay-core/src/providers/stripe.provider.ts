import { providerNotImplemented } from "../errors";
import { PROVIDER_CAPABILITIES } from "./capabilities";
import type { PaymentProvider } from "./provider.types";

/**
 * Placeholder used when no Stripe client is configured. The API supplies
 * the real adapter (it owns the Stripe SDK and secrets) through
 * `createProviderRegistry({ stripe })`.
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
    async ensureCustomer() {
      throw providerNotImplemented("stripe", "ensureCustomer");
    },
    async chargeSaved() {
      throw providerNotImplemented("stripe", "chargeSaved");
    },
  };
}
