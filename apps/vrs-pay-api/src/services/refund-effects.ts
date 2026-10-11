import {
  createLedgerTransaction,
  isCurrencyCode,
  money,
  newId,
  refundPosting,
} from "@vrs-pay/core";
import type { Effects } from "./event.types";
import { buildEvent, nowSeconds } from "./events";
import type { StoredPayment } from "./payment.types";
import type { Refund, StoredRefund } from "./refund.types";

/**
 * The tax inside a refund of `amount`, in proportion to the payment's tax.
 * Worked out on the running total, so a payment refunded in pieces gives
 * back exactly its tax once fully refunded.
 */
export function refundedTax(payment: StoredPayment["payment"], amount: number): number {
  if (payment.amount_tax <= 0 || payment.amount <= 0) return 0;
  const taxUpTo = (refunded: number) =>
    Math.round((Math.min(refunded, payment.amount) * payment.amount_tax) / payment.amount);
  return taxUpTo(payment.amount_refunded + amount) - taxUpTo(payment.amount_refunded);
}

/** A pending refund of `amount` against a stored payment. */
export function newRefund(
  stored: StoredPayment,
  amount: number,
  details: Pick<Refund, "reason" | "metadata" | "provider_reference">,
): StoredRefund {
  const { payment } = stored;
  return {
    merchantId: stored.merchantId,
    mode: stored.mode,
    provider: payment.provider,
    refund: {
      id: newId("refund"),
      object: "refund",
      livemode: stored.mode === "live",
      status: "pending",
      amount,
      amount_tax: refundedTax(payment, amount),
      currency: payment.currency,
      payment: payment.id,
      created: nowSeconds(),
      ...details,
    },
  };
}

/** Succeeded: post it to the ledger and tell the merchant. Failed: just tell them. */
export function refundEffects(stored: StoredRefund): Effects {
  const { merchantId, mode, provider, refund } = stored;
  if (refund.status === "failed")
    return { event: buildEvent(merchantId, mode, "refund.failed", refund) };
  if (refund.status !== "succeeded") return {};
  const currency = refund.currency.toUpperCase();
  if (!isCurrencyCode(currency)) throw new Error(`Unsupported refund currency ${currency}.`);
  const transaction = createLedgerTransaction({
    description: `Refund ${refund.id} of ${refund.payment}`,
    entries: refundPosting({
      merchantId,
      provider,
      amount: money(refund.amount, currency),
      tax: money(refund.amount_tax, currency),
    }),
  });
  return {
    ledger: { mode, source: { type: "refund", id: refund.id }, transaction },
    event: buildEvent(merchantId, mode, "refund.succeeded", refund),
  };
}
