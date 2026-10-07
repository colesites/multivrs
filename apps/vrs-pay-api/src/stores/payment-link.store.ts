import type { ApiKeyMode } from "@vrs-pay/core";
import type { StoredPaymentLink } from "../services/payment-link.types";

export interface PaymentLinkStore {
  create(record: StoredPaymentLink): Promise<void>;
  /** Newest first. */
  list(merchantId: string, mode: ApiKeyMode, limit: number): Promise<StoredPaymentLink[]>;
  /** Unscoped: links are opened by anyone with the URL. */
  find(id: string): Promise<StoredPaymentLink | null>;
  setActive(
    merchantId: string,
    mode: ApiKeyMode,
    id: string,
    active: boolean,
  ): Promise<StoredPaymentLink | null>;
}
