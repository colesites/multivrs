import type { ApiKeyMode, ProviderId } from "@vrs-pay/core";
import type { Effects } from "../services/event.types";
import type { StoredPayment } from "../services/payment.types";

export interface PaymentStore {
  /**
   * Records a captured payment, completes its checkout session and writes
   * the effects, all at once. Returns false if the provider payment was
   * already recorded (webhook redelivery).
   */
  recordCapture(payment: StoredPayment, effects: Effects): Promise<boolean>;
  get(merchantId: string, mode: ApiKeyMode, id: string): Promise<StoredPayment | null>;
  findByReference(provider: ProviderId, reference: string): Promise<StoredPayment | null>;
  /** Newest first. */
  list(merchantId: string, mode: ApiKeyMode, limit: number): Promise<StoredPayment[]>;
}
