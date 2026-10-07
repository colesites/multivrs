import type { ApiKeyMode, ProviderId } from "@vrs-pay/core";
import type { Effects } from "../services/event.types";
import type { RefundUpdate, StoredRefund } from "../services/refund.types";

export type RefundLookup = { id: string } | { provider: ProviderId; reference: string };

export interface RefundStore {
  /**
   * Inserts a pending refund and reserves its amount on the payment, only
   * if that keeps the total refunded within the payment amount.
   */
  reserve(refund: StoredRefund): Promise<boolean>;
  /**
   * Applies a provider update. Pending keeps the reservation; failed
   * releases it; the effects are written on the move to a final status.
   * Returns null when the refund had already reached a final status.
   */
  settle(
    id: string,
    update: RefundUpdate,
    effects: (refund: StoredRefund) => Effects,
  ): Promise<StoredRefund | null>;
  get(merchantId: string, mode: ApiKeyMode, id: string): Promise<StoredRefund | null>;
  /** Unscoped lookup for webhooks; callers check the owner. */
  find(lookup: RefundLookup): Promise<StoredRefund | null>;
  /** Newest first. */
  list(merchantId: string, mode: ApiKeyMode, limit: number): Promise<StoredRefund[]>;
}
