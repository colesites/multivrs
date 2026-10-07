import type { AccountUpdatedData, ApiKeyMode, ProviderId } from "@vrs-pay/core";
import type { MerchantProfile } from "../app.types";

export interface ProviderAccountOwner {
  merchantId: string;
  mode: ApiKeyMode;
}

/** Merchants' accounts at each provider, and provider events already handled. */
export interface ProviderAccountStore {
  /** Null for accounts VRS Pay doesn't own (the Stripe platform is shared). */
  findOwner(provider: ProviderId, externalId: string): Promise<ProviderAccountOwner | null>;
  updateStatus(provider: ProviderId, update: AccountUpdatedData): Promise<void>;
  /** The merchant as seen in `mode` (fee rate + active accounts), for background work. */
  merchantProfile(merchantId: string, mode: ApiKeyMode): Promise<MerchantProfile | null>;
}

export interface ProviderEventStore {
  has(provider: ProviderId, eventId: string): Promise<boolean>;
  add(provider: ProviderId, eventId: string, type: string): Promise<void>;
}
