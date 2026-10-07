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
    entries: refundPosting({ merchantId, provider, amount: money(refund.amount, currency) }),
  });
  return {
    ledger: { mode, source: { type: "refund", id: refund.id }, transaction },
    event: buildEvent(merchantId, mode, "refund.succeeded", refund),
  };
}
