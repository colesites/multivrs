import { IDEMPOTENCY_TTL_MS } from "./idempotency";
import type { IdempotencyRecord, IdempotencyStore } from "./idempotency.types";

/**
 * In-memory store for tests and local dev. Single-process only — production
 * uses Postgres so claims are atomic across instances.
 */
export function createMemoryIdempotencyStore(
  ttlMs: number = IDEMPOTENCY_TTL_MS,
  now: () => number = Date.now,
): IdempotencyStore {
  const records = new Map<string, IdempotencyRecord>();
  const keyOf = (scope: string, key: string) => `${scope}\u0000${key}`;

  const live = (id: string): IdempotencyRecord | null => {
    const record = records.get(id);
    if (!record) return null;
    if (now() - record.createdAt > ttlMs) {
      records.delete(id);
      return null;
    }
    return record;
  };

  return {
    async claim(scope, key, requestHash) {
      const id = keyOf(scope, key);
      const existing = live(id);
      if (existing) return existing;
      records.set(id, { state: "in_progress", requestHash, createdAt: now() });
      return null;
    },
    async complete(scope, key, result) {
      const id = keyOf(scope, key);
      const existing = live(id);
      if (!existing) return;
      records.set(id, {
        state: "completed",
        requestHash: existing.requestHash,
        createdAt: existing.createdAt,
        status: result.status,
        body: result.body,
      });
    },
    async release(scope, key) {
      records.delete(keyOf(scope, key));
    },
  };
}
