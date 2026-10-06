import type { ApiKeyMode, IdempotencyStore, ProviderId, ProviderRegistry } from "@vrs-pay/core";
import type { ApiKeyStore } from "./stores/api-key.store";
import type { CheckoutSessionStore } from "./stores/checkout-session.store";

/** A merchant as the API sees it. */
export interface MerchantProfile {
  id: string;
  /** Providers this merchant has onboarded with. */
  enabledProviders: readonly ProviderId[];
  /** Connected account / subaccount id per provider. */
  providerAccounts: Partial<Record<ProviderId, string>>;
  /** VRS Pay's fee rate for this merchant, in basis points (150 = 1.5%). */
  platformFeeBps: number;
}

/** The authenticated merchant plus the mode of the key that was used. */
export interface MerchantContext extends MerchantProfile {
  mode: ApiKeyMode;
}

/** Everything the app needs, injected so tests can swap any piece. */
export interface AppDeps {
  apiKeys: ApiKeyStore;
  idempotency: IdempotencyStore;
  checkoutSessions: CheckoutSessionStore;
  providers: ProviderRegistry;
}

export interface AppEnv {
  Variables: {
    requestId: string;
    merchant: MerchantContext;
  };
}
