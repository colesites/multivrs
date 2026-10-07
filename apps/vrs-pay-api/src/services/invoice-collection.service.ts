import { CurrencyCodeSchema, money } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { StoredEvent } from "./event.types";
import { buildEvent } from "./events";
import { paidInvoice } from "./invoice-builder";
import { recordDecline, withStatus } from "./invoice-dunning";
import { capturedPayment } from "./payment-builder";
import { feeFor, PLATFORM_ACCOUNT, providersFor } from "./platform";
import type { StoredInvoice } from "./subscription.types";

/** When we don't know if a charge went through, ask again (same idempotency key) after this. */
const UNKNOWN_RETRY_SECONDS = 3_600;

export type CollectionOutcome = "paid" | "failed" | "canceled" | "retry_later" | "skipped";

/**
 * Charges an open subscription invoice off-session. Success pays it (and
 * revives a past-due subscription); a decline schedules the next retry and
 * marks the subscription past due; the last decline cancels it.
 */
export async function collectInvoice(
  deps: AppDeps,
  stored: StoredInvoice,
  now: number,
): Promise<CollectionOutcome> {
  const { merchantId, mode, invoice } = stored;
  const sub = invoice.subscription
    ? await deps.billing.findSubscription(invoice.subscription)
    : null;
  if (!sub || invoice.status !== "open") return "skipped";
  const merchant = await deps.providerAccounts.merchantProfile(merchantId, mode);
  const fee = merchant
    ? feeFor(merchant, money(invoice.total, CurrencyCodeSchema.parse(invoice.currency)))
    : null;
  const method = sub.subscription.payment_method
    ? await deps.billing.getPaymentMethod(sub.subscription.payment_method)
    : null;
  const providerCustomer = await deps.billing.getProviderCustomer(invoice.customer, sub.provider);
  const amount = money(invoice.total, CurrencyCodeSchema.parse(invoice.currency));
  const attempt = invoice.attempt_count + 1;

  const result =
    merchant && fee && method && providerCustomer
      ? await providersFor(deps, sub.mode)[sub.provider].chargeSaved({
          merchantAccountId: null,
          statementDescriptor: merchant.name,
          providerCustomer,
          methodRef: method.providerRef,
          amount,
          platformFee: fee,
          description: `Invoice ${invoice.id}`,
          metadata: { vrs_invoice_id: invoice.id, vrs_subscription_id: sub.subscription.id },
          idempotencyKey: `${invoice.id}-${attempt}`,
        })
      : ({ status: "declined", reference: null, message: "No saved payment method." } as const);

  if (result.status === "succeeded" && fee) {
    const { payment, posting } = capturedPayment({
      merchantId,
      mode,
      provider: sub.provider,
      providerAccountId: PLATFORM_ACCOUNT,
      providerReference: result.reference,
      amount,
      platformFee: fee,
      providerFee: result.providerFee,
      checkoutSession: null,
      customerEmail: null,
      metadata: { vrs_invoice_id: invoice.id },
    });
    const paid = paidInvoice(stored, payment.payment.id);
    const revived = sub.subscription.status === "active" ? null : withStatus(sub, "active", now);
    const events: StoredEvent[] = [
      buildEvent(merchantId, mode, "payment.succeeded", payment.payment),
      buildEvent(merchantId, mode, "invoice.paid", paid.invoice),
      ...(revived
        ? [buildEvent(merchantId, mode, "subscription.updated", revived.subscription)]
        : []),
    ];
    const ok = await deps.billing.commit({
      invoices: [{ record: paid, create: false }],
      payments: [payment],
      subscriptions: revived ? [{ record: revived, expectedVersion: sub.version }] : [],
      effects: { ledger: posting, events },
    });
    return ok ? "paid" : "skipped";
  }

  if (result.status === "error") {
    const later = {
      ...stored,
      invoice: { ...invoice, next_attempt_at: now + UNKNOWN_RETRY_SECONDS },
    };
    await deps.billing.commit({ invoices: [{ record: later, create: false }] });
    return "retry_later";
  }

  return recordDecline(deps, stored, sub, attempt, now);
}
