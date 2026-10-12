import type { ApiKeyMode, ProviderId } from "@vrs-pay/core";
import type { StoredDispute } from "../services/dispute.types";
import type { Effects } from "../services/event.types";

export interface DisputeStore {
  /**
   * Inserts a dispute (`expectedVersion` null) or updates one still at
   * `expectedVersion`, writing the effects in the same transaction. False
   * when someone else saved it first.
   */
  save(record: StoredDispute, expectedVersion: number | null, effects: Effects): Promise<boolean>;
  get(merchantId: string, mode: ApiKeyMode, id: string): Promise<StoredDispute | null>;
  /** Unscoped lookup for webhooks; callers check the owner. */
  find(provider: ProviderId, reference: string): Promise<StoredDispute | null>;
  /** Newest first. */
  list(merchantId: string, mode: ApiKeyMode, limit: number): Promise<StoredDispute[]>;
}
