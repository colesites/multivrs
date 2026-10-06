import type { MerchantProfile } from "../app.types";

export interface ApiKeyRecord {
  /** SHA-256 of the key — the plaintext is never stored. */
  hash: string;
  merchant: MerchantProfile;
}

/** Looks up API keys by hash. */
export interface ApiKeyStore {
  findByHash(hash: string): Promise<ApiKeyRecord | null>;
  add(record: ApiKeyRecord): Promise<void>;
}

/** In-memory store for tests and local dev. */
export function createMemoryApiKeyStore(): ApiKeyStore {
  const byHash = new Map<string, ApiKeyRecord>();
  return {
    async findByHash(hash) {
      return byHash.get(hash) ?? null;
    },
    async add(record) {
      byHash.set(record.hash, record);
    },
  };
}
