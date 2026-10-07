import { providerNotImplemented } from "../errors";
import { PROVIDER_CAPABILITIES } from "./capabilities";
import type { PaymentProvider } from "./provider.types";

/**
 * Paystack adapter — subaccounts + split payments. Implementation notes:
 *
 * - createCheckout → `POST https://api.paystack.co/transaction/initialize`
 *   `{ email, amount (minor units), currency, reference: sessionId,
 *   subaccount: merchantAccountId, transaction_charge: platformFee,
 *   bearer: "subaccount", callback_url: successUrl, channels, metadata }`
 *   → `data.authorization_url`
 * - refund → `POST https://api.paystack.co/refund` `{ transaction, amount }`
 * - parseWebhook → verify `x-paystack-signature` (HMAC-SHA512 of the raw
 *   body with the secret key), then map `charge.success` → `payment.succeeded`.
 */
export function createPaystackProvider(): PaymentProvider {
  return {
    id: "paystack",
    capabilities: PROVIDER_CAPABILITIES.paystack,
    async createCheckout() {
      throw providerNotImplemented("paystack", "createCheckout");
    },
    async refund() {
      throw providerNotImplemented("paystack", "refund");
    },
    async parseWebhook() {
      throw providerNotImplemented("paystack", "parseWebhook");
    },
    async ensureCustomer() {
      throw providerNotImplemented("paystack", "ensureCustomer");
    },
    async chargeSaved() {
      throw providerNotImplemented("paystack", "chargeSaved");
    },
  };
}
