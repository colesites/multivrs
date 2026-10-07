import { type ApiKeyMode, type Money, newId } from "@vrs-pay/core";
import { nowSeconds } from "./events";
import type { BillingReason, InvoiceLine, StoredInvoice } from "./subscription.types";

export interface InvoiceDraft {
  reason: BillingReason;
  merchantId: string;
  mode: ApiKeyMode;
  customer: string;
  subscription: string | null;
  total: Money;
  lines: InvoiceLine[];
  periodStart: number;
  periodEnd: number;
}

/** An open invoice, due now. */
export function openInvoice(draft: InvoiceDraft): StoredInvoice {
  const now = nowSeconds();
  return {
    merchantId: draft.merchantId,
    mode: draft.mode,
    invoice: {
      id: newId("invoice"),
      object: "invoice",
      livemode: draft.mode === "live",
      customer: draft.customer,
      subscription: draft.subscription,
      status: "open",
      billing_reason: draft.reason,
      currency: draft.total.currency.toLowerCase(),
      subtotal: draft.total.amount,
      tax: 0,
      total: draft.total.amount,
      lines: draft.lines,
      period_start: draft.periodStart,
      period_end: draft.periodEnd,
      attempt_count: 0,
      next_attempt_at: now,
      payment: null,
      paid_at: null,
      created: now,
    },
  };
}

/** The same invoice, paid by `paymentId`. */
export function paidInvoice(stored: StoredInvoice, paymentId: string): StoredInvoice {
  const now = nowSeconds();
  const attempts = stored.invoice.attempt_count + 1;
  return {
    ...stored,
    invoice: {
      ...stored.invoice,
      status: "paid",
      payment: paymentId,
      paid_at: now,
      attempt_count: attempts,
      next_attempt_at: null,
    },
  };
}

export function subscriptionLine(
  description: string,
  quantity: number,
  amount: Money,
  periodStart: number,
  periodEnd: number,
): InvoiceLine {
  return {
    kind: "subscription",
    description,
    quantity,
    amount: amount.amount,
    period_start: periodStart,
    period_end: periodEnd,
  };
}
