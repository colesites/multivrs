import {
  createMemoryIdempotencyStore,
  createProviderRegistry,
  hashApiKey,
  PROVIDER_IDS,
  parseApiKey,
} from "@vrs-pay/core";
import type { AppDeps, MerchantProfile } from "./app.types";
import { createMemoryApiKeyStore } from "./stores/api-key.store";
import { createMemoryCheckoutSessionStore } from "./stores/checkout-session.store";

/** A local merchant connected to every provider with placeholder accounts. */
export const DEV_MERCHANT: MerchantProfile = {
  id: "mer_dev0000000000000000000000",
  enabledProviders: PROVIDER_IDS,
  providerAccounts: {
    stripe: "acct_dev",
    paystack: "ACCT_dev",
    flutterwave: "RS_dev",
  },
  platformFeeBps: 0,
};

/**
 * In-memory dependencies for `bun run dev`. Database-backed stores implement
 * the same interfaces; the app itself doesn't change.
 */
export async function createDevDependencies(
  env: Record<string, string | undefined>,
): Promise<AppDeps> {
  const apiKeys = createMemoryApiKeyStore();
  const devKey = env.VRS_DEV_SECRET_KEY;
  if (devKey) {
    const parsed = parseApiKey(devKey);
    if (parsed?.kind !== "secret" || parsed.mode !== "test") {
      throw new Error("VRS_DEV_SECRET_KEY must be a test secret key (sk_test_…).");
    }
    await apiKeys.add({ hash: await hashApiKey(devKey), merchant: DEV_MERCHANT });
  }
  return {
    apiKeys,
    idempotency: createMemoryIdempotencyStore(),
    checkoutSessions: createMemoryCheckoutSessionStore(),
    providers: createProviderRegistry(),
  };
}
