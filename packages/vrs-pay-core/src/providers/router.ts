import { invalidRequest } from "../errors";
import type { CurrencyCode } from "../money/currency";
import { providerSupports } from "./capabilities";
import type { PaymentMethod, ProviderId } from "./provider.types";

/** Currencies where local African rails beat global card acquiring. */
const AFRICAN_CURRENCIES: readonly CurrencyCode[] = ["NGN", "GHS", "KES", "ZAR"];

export const DEFAULT_PREFERENCE = {
  african: ["paystack", "flutterwave", "stripe"],
  global: ["stripe", "flutterwave", "paystack"],
} as const satisfies Record<string, readonly ProviderId[]>;

export interface RouteRequest {
  currency: CurrencyCode;
  method: PaymentMethod;
  /** Providers this merchant has onboarded with. */
  enabledProviders: readonly ProviderId[];
  /** Overrides the default order (e.g. a merchant's own preference). */
  preference?: readonly ProviderId[];
}

export interface RouteDecision {
  provider: ProviderId;
  /** Ordered alternatives if the primary is down or declines. */
  fallbacks: ProviderId[];
}

export function defaultPreference(currency: CurrencyCode): readonly ProviderId[] {
  return AFRICAN_CURRENCIES.includes(currency)
    ? DEFAULT_PREFERENCE.african
    : DEFAULT_PREFERENCE.global;
}

/**
 * Picks the provider for a payment: the first provider in preference order
 * that the merchant has enabled and that supports the currency + method.
 */
export function routePayment(request: RouteRequest): RouteDecision {
  const order = request.preference ?? defaultPreference(request.currency);
  const candidates = order.filter(
    (provider) =>
      request.enabledProviders.includes(provider) &&
      providerSupports(provider, request.currency, request.method),
  );
  const [provider, ...fallbacks] = candidates;
  if (!provider) {
    throw invalidRequest(
      "no_provider_available",
      `No enabled provider supports ${request.method} payments in ${request.currency}.`,
      "payment_method",
    );
  }
  return { provider, fallbacks };
}
