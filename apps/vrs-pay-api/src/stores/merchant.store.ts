import type { ApiKeyKind, ApiKeyMode, ProviderId } from "@vrs-pay/core";

export interface MerchantRecord {
  id: string;
  name: string;
  email: string;
  platformFeeBps: number;
  created: number;
}

export interface ApiKeySummary {
  id: string;
  object: "api_key";
  kind: ApiKeyKind;
  livemode: boolean;
  /** e.g. `sk_test_4f9K…` — the full key is only shown when created. */
  display_prefix: string;
  created: number;
  revoked: boolean;
}

export interface NewApiKey {
  id: string;
  mode: ApiKeyMode;
  kind: ApiKeyKind;
  hash: string;
  displayPrefix: string;
}

export interface ProviderAccountRecord {
  provider: ProviderId;
  externalId: string;
  status: "pending" | "active" | "restricted";
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

/** Merchant accounts as the dashboard manages them. */
export interface Membership {
  merchantId: string;
  name: string;
  role: string;
}

export interface MerchantStore {
  /** The merchant a dashboard user belongs to (first membership). */
  forUser(userId: string): Promise<{ merchantId: string; role: string } | null>;
  /** Every business the user belongs to, oldest first. */
  listForUser(userId: string): Promise<Membership[]>;
  /** A new merchant owned by the user — every sign-up gets one, and more can be added. */
  createForUser(
    user: { id: string; name: string; email: string },
    merchant: MerchantRecord,
  ): Promise<void>;
  get(merchantId: string): Promise<MerchantRecord | null>;
  rename(merchantId: string, name: string): Promise<void>;
  listKeys(merchantId: string, mode: ApiKeyMode): Promise<ApiKeySummary[]>;
  addKey(merchantId: string, key: NewApiKey): Promise<void>;
  revokeKey(merchantId: string, id: string): Promise<boolean>;
  getProviderAccount(
    merchantId: string,
    mode: ApiKeyMode,
    provider: ProviderId,
  ): Promise<ProviderAccountRecord | null>;
  saveProviderAccount(
    merchantId: string,
    mode: ApiKeyMode,
    account: ProviderAccountRecord,
  ): Promise<void>;
}
