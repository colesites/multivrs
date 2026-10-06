import { createFlutterwaveProvider } from "./flutterwave.provider";
import { createPaystackProvider } from "./paystack.provider";
import type { ProviderRegistry } from "./provider.types";
import { createStripeProvider } from "./stripe.provider";

/** The default adapter for every provider id; tests can swap any of them. */
export function createProviderRegistry(
  overrides: Partial<ProviderRegistry> = {},
): ProviderRegistry {
  return {
    stripe: overrides.stripe ?? createStripeProvider(),
    paystack: overrides.paystack ?? createPaystackProvider(),
    flutterwave: overrides.flutterwave ?? createFlutterwaveProvider(),
  };
}
