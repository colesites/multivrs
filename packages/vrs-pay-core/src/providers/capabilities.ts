import type { CurrencyCode } from "../money/currency";
import type { PaymentMethod, ProviderCapabilities, ProviderId } from "./provider.types";

/**
 * Starting routing table: which currencies and methods we route to each
 * provider. Deliberately conservative — verify against each provider's
 * current coverage for the merchant's country before go-live.
 */
export const PROVIDER_CAPABILITIES: Record<ProviderId, ProviderCapabilities> = {
  stripe: {
    currencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR", "BRL"],
    methods: ["card", "apple_pay", "google_pay", "sepa_debit"],
  },
  paystack: {
    currencies: ["NGN", "GHS", "KES", "ZAR", "USD"],
    methods: ["card", "bank_transfer", "ussd", "mobile_money"],
  },
  flutterwave: {
    currencies: ["NGN", "GHS", "KES", "ZAR", "USD", "EUR", "GBP"],
    methods: ["card", "bank_transfer", "ussd", "mobile_money"],
  },
};

export function providerSupports(
  provider: ProviderId,
  currency: CurrencyCode,
  method: PaymentMethod,
): boolean {
  const { currencies, methods } = PROVIDER_CAPABILITIES[provider];
  return currencies.includes(currency) && methods.includes(method);
}
