import type { ApiKeyMode, ProviderId } from "@vrs-pay/core";
import type { Effects } from "../services/event.types";
import type { PayoutUpdate, StoredPayout } from "../services/payout.types";

export interface PayoutStore {
  /**
   * Inserts a pending payout with its effects (the balance it takes), unless
   * the merchant already has one in that currency for that day.
   */
  create(record: StoredPayout, effects: Effects): Promise<boolean>;
  /**
   * Moves a pending payout to paid or failed (or a paid one to failed, when
   * the bank sends it back), writing the effects; null when it can't move.
   */
  settle(
    id: string,
    update: PayoutUpdate,
    effects: (payout: StoredPayout) => Effects,
  ): Promise<StoredPayout | null>;
  get(merchantId: string, mode: ApiKeyMode, id: string): Promise<StoredPayout | null>;
  /** Unscoped lookup for webhooks. */
  find(rail: ProviderId, reference: string): Promise<StoredPayout | null>;
  /** Newest first. */
  list(merchantId: string, mode: ApiKeyMode, limit: number): Promise<StoredPayout[]>;
  /** Payouts still waiting on the provider that were made before `before` (unix seconds). */
  pendingBefore(before: number): Promise<StoredPayout[]>;
}

/** Pending payouts end paid or failed; a paid one can still fail if the bank returns it. */
export function canMove(from: string, to: "paid" | "failed"): boolean {
  return from === "pending" || (from === "paid" && to === "failed");
}
