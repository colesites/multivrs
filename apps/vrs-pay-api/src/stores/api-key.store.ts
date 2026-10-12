import type { MerchantProfile } from "../app.types";

export interface ApiKeyRecord {
  /** SHA-256 of the key — the plaintext is never stored. */
  hash: string;
  /** The merchant as seen with this key's mode (test or live accounts). */
  merchant: MerchantProfile;
}

/** Looks up API keys by hash; the key's prefix says whether it's secret or publishable. */
export interface ApiKeyStore {
  findByHash(hash: string): Promise<ApiKeyRecord | null>;
  /** Notes the key was just used (at most about hourly, to spare writes). */
  markUsed?(hash: string, at: Date): Promise<void>;
}
