import type { ApiKeyMode, ProviderId, ProviderRegistry } from "@vrs-pay/core";
import type { IdentityVerifier } from "./identity/identity.types";
import type { Sealer } from "./lib/sealer";
import type { Stores } from "./stores/stores.types";

/** A merchant as the API sees it. */
export interface MerchantProfile {
  id: string;
  /** Business name, shown on customers' card statements. */
  name: string;
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

/** The platform's provider credentials for one mode: test keys for test traffic, live for live. */
export interface ModeProviders {
  providers: ProviderRegistry;
  /** Providers the platform has accounts with in this mode; empty means it can't take payments. */
  platformProviders: readonly ProviderId[];
}

/** Everything the app needs, injected so tests can swap any piece. */
export interface AppDeps extends Stores {
  /** One server serves both modes; each request's mode picks the credentials. */
  modes: Record<ApiKeyMode, ModeProviders>;
  /** Dashboard sign-in; without it the dashboard routes aren't mounted. */
  auth?: DashboardAuth;
  /** Checks merchants' official IDs (sandbox in test mode). */
  identity?: IdentityVerifier;
  /** Encrypts merchants' bank details at rest; without it they can't be saved. */
  sealer?: Sealer;
  /** Public origins: this API (payment link URLs) and the VRS Pay site (thank-you page). */
  urls: { api: string; site: string };
}

export interface DashboardUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

/** The dashboard's login system (Better Auth in production, a fake in tests). */
export interface DashboardAuth {
  /** The dashboard's origin, allowed to call /auth and /dashboard with cookies. */
  origin: string;
  /** Configured social sign-in providers, e.g. ["github", "google"]. */
  socialProviders: string[];
  handler(request: Request): Promise<Response>;
  /** The signed-in user for these request headers, or null. */
  session(headers: Headers): Promise<DashboardUser | null>;
}

export interface AppEnv {
  Variables: {
    requestId: string;
    merchant: MerchantContext;
    user: DashboardUser;
  };
}
