import type { Payment } from "./payment.types";

/**
 * What the merchant is owed for a payment, as the ledger books it: the
 * amount less tax and our fee, less refunds (whose tax share comes back
 * out of tax, not the merchant). The provider's fee is the platform's cost.
 */
export function merchantNet(payment: Payment): number {
  const refundedTax =
    payment.amount > 0
      ? Math.round((payment.amount_refunded * payment.amount_tax) / payment.amount)
      : 0;
  return (
    payment.amount -
    payment.amount_tax -
    payment.platform_fee -
    (payment.amount_refunded - refundedTax)
  );
}
