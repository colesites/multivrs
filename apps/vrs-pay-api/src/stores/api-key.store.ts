import type { MerchantProfile } from "../app.types";

export interface ApiKeyRecord {
  /** SHA-256 of the key — the plaintext is never stored. */
  hash: string;
  /** The merchant as seen with this key's mode (test or live accounts). */
  merchant: MerchantProfile;
}

/** Looks up API keys by hash. */
export interface ApiKeyStore {
  findByHash(hash: string): Promise<ApiKeyRecord | null>;
}
