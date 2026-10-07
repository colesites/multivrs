import { CurrencyCodeSchema, cardError, idempotencyError, money } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import { entitlementsFor } from "./entitlements.service";
import { buildEvent } from "./events";
import { openInvoice, paidInvoice } from "./invoice-builder";
import { capturedPayment } from "./payment-builder";
import { feeFor, PLATFORM_ACCOUNT, providersFor } from "./platform";
import type { StoredSubscription, Subscription } from "./subscription.types";

/**
 * Charges the prorated difference of an upgrade off-session and, only if it
 * succeeds, applies `next` with a paid proration invoice.
 */
export async function chargeUpgrade(
  deps: AppDeps,
  merchant: MerchantContext,
  sub: StoredSubscription,
  next: Subscription,
  {
    planName,
    due,
    currency,
    now,
  }: { planName: string; due: number; currency: string; now: number },
): Promise<Subscription> {
  const s = sub.subscription;
  const quantity = next.quantity;
  const amount = money(due, CurrencyCodeSchema.parse(currency));
  const fee = feeFor(merchant, amount);
  const method = s.payment_method ? await deps.billing.getPaymentMethod(s.payment_method) : null;
  const providerCustomer = await deps.billing.getProviderCustomer(s.customer, sub.provider);
  if (!method || !providerCustomer) throw cardError("card_declined", "No saved payment method.");
  const result = await providersFor(deps, sub.mode)[sub.provider].chargeSaved({
    merchantAccountId: null,
    statementDescriptor: merchant.name,
    providerCustomer,
    methodRef: method.providerRef,
    amount,
    platformFee: fee,
    description: `${planName}: prorated upgrade`,
    metadata: { vrs_subscription_id: s.id },
    idempotencyKey: `${s.id}-change-${sub.version}`,
  });
  if (result.status !== "succeeded") {
    throw cardError(
      result.status === "requires_action" ? "authentication_required" : "card_declined",
      result.message,
    );
  }

  const { merchantId, mode } = sub;
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
    metadata: { vrs_subscription_id: s.id },
  });
  const end = s.current_period_end ?? now;
  const line = {
    kind: "proration" as const,
    description: `${planName} × ${quantity} (rest of period)`,
    quantity,
    amount: due,
    period_start: now,
    period_end: end,
  };
  const invoice = paidInvoice(
    openInvoice({
      reason: "subscription_update",
      merchantId,
      mode,
      customer: s.customer,
      subscription: s.id,
      total: amount,
      lines: [line],
      periodStart: now,
      periodEnd: end,
    }),
    payment.payment.id,
  );
  const record = { ...sub, version: sub.version + 1, subscription: next };
  const entitlements = await entitlementsFor(deps, { merchantId, mode }, s.customer, [record]);
  const ok = await deps.billing.commit({
    subscriptions: [{ record, expectedVersion: sub.version }],
    invoices: [{ record: invoice, create: true }],
    payments: [payment],
    effects: {
      ledger: posting,
      events: [
        buildEvent(merchantId, mode, "payment.succeeded", payment.payment),
        buildEvent(merchantId, mode, "invoice.paid", invoice.invoice),
        buildEvent(merchantId, mode, "subscription.updated", next),
        buildEvent(merchantId, mode, "entitlements.updated", entitlements),
      ],
    },
  });
  // Retrying is safe: the charge's idempotency key is tied to this version.
  if (!ok)
    throw idempotencyError(
      "subscription_changed",
      "The subscription changed while updating; try again.",
    );
  return next;
}
