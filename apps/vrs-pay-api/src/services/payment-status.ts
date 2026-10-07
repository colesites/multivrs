import type { PaymentStatus } from "./payment.types";

/** A payment's status once `refunded` of `amount` is refunded or reserved for a refund. */
export function paymentStatusFor(amount: number, refunded: number): PaymentStatus {
  if (refunded <= 0) return "succeeded";
  return refunded >= amount ? "refunded" : "partially_refunded";
}
