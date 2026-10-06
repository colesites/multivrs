export interface InProgressRecord {
  state: "in_progress";
  requestHash: string;
  createdAt: number;
}

export interface CompletedRecord {
  state: "completed";
  requestHash: string;
  createdAt: number;
  status: number;
  body: string;
}

export type IdempotencyRecord = InProgressRecord | CompletedRecord;

/**
 * Persistence for idempotency keys, scoped per merchant + mode. `claim` must
 * be atomic (e.g. INSERT … ON CONFLICT DO NOTHING in Postgres).
 */
export interface IdempotencyStore {
  /** Claims `key`; returns null if newly claimed, else the existing record. */
  claim(scope: string, key: string, requestHash: string): Promise<IdempotencyRecord | null>;
  complete(scope: string, key: string, result: { status: number; body: string }): Promise<void>;
  /** Frees the key so the client can retry (used after 5xx responses). */
  release(scope: string, key: string): Promise<void>;
}

export type IdempotencyDecision =
  | { kind: "proceed" }
  | { kind: "replay"; status: number; body: string };
