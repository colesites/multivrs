import type { ApiKeyRecord, ApiKeyStore } from "../api-key.store";

export interface MemoryApiKeyStore extends ApiKeyStore {
  add(record: ApiKeyRecord): Promise<void>;
}

/** In-memory keys for tests and local dev. */
export function createMemoryApiKeyStore(): MemoryApiKeyStore {
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
