import { providerNotImplemented } from "../errors";
import { PROVIDER_CAPABILITIES } from "./capabilities";
import type { PaymentProvider } from "./provider.types";

/**
 * Flutterwave adapter — subaccounts + split payments. Implementation notes:
 *
 * - createCheckout → `POST https://api.flutterwave.com/v3/payments`
 *   `{ tx_ref: sessionId, amount (major units), currency, redirect_url,
 *   customer, subaccounts: [{ id: merchantAccountId }], meta }` → `data.link`
 * - refund → `POST /v3/transactions/:id/refund` `{ amount }`
 * - parseWebhook → compare the `verif-hash` header with the configured
 *   secret hash, then re-verify via `GET /v3/transactions/:id/verify`.
 */
export function createFlutterwaveProvider(): PaymentProvider {
  return {
    id: "flutterwave",
    capabilities: PROVIDER_CAPABILITIES.flutterwave,
    async createCheckout() {
      throw providerNotImplemented("flutterwave", "createCheckout");
    },
    async refund() {
      throw providerNotImplemented("flutterwave", "refund");
    },
    async parseWebhook() {
      throw providerNotImplemented("flutterwave", "parseWebhook");
    },
    async ensureCustomer() {
      throw providerNotImplemented("flutterwave", "ensureCustomer");
    },
    async chargeSaved() {
      throw providerNotImplemented("flutterwave", "chargeSaved");
    },
  };
}
