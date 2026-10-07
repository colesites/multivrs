import type { StoredPayment } from "../../services/payment.types";

/** A stored payment as a `payments` row. */
export function paymentRow({ merchantId, mode, providerAccountId, payment }: StoredPayment) {
  return {
    id: payment.id,
    merchantId,
    mode,
    checkoutSessionId: payment.checkout_session,
    provider: payment.provider,
    providerAccountId,
    providerReference: payment.provider_reference,
    status: payment.status,
    amount: BigInt(payment.amount),
    amountRefunded: BigInt(payment.amount_refunded),
    currency: payment.currency.toUpperCase(),
    platformFee: BigInt(payment.platform_fee),
    providerFee: BigInt(payment.provider_fee),
    customerEmail: payment.customer_email,
    metadata: payment.metadata,
    createdAt: new Date(payment.created * 1000),
  };
}
