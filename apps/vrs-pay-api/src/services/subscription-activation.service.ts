import type { CheckoutCompletedData } from "@vrs-pay/core";
import { money, newId, type ProviderId, type SavedMethod } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import { addDays, addInterval, findRecurringPrice, periodAmount } from "./billing-helpers";
import type { EventOutcome } from "./capture.service";
import type { StoredCheckoutSession } from "./checkout-session.types";
import { entitlementsFor } from "./entitlements.service";
import { buildEvent, nowSeconds } from "./events";
import { openInvoice, paidInvoice, subscriptionLine } from "./invoice-builder";
import { capturedPayment } from "./payment-builder";
import { PLATFORM_ACCOUNT } from "./platform";
import type { PaymentMethodRecord, StoredSubscription } from "./subscription.types";

async function methodRecord(
  deps: AppDeps,
  customerId: string,
  provider: ProviderId,
  saved: SavedMethod | null,
): Promise<PaymentMethodRecord | null> {
  if (!saved) return null;
  const existing = await deps.billing.findPaymentMethodByRef(provider, saved.reference);
  const { reference: providerRef, brand, last4, expMonth, expYear } = saved;
  return {
    id: existing?.id ?? newId("paymentMethod"),
    customerId,
    provider,
    providerRef,
    brand,
    last4,
    expMonth,
    expYear,
  };
}

/** Events for a subscription that just started (including its new entitlements). */
async function startEvents(deps: AppDeps, sub: StoredSubscription) {
  const { merchantId, mode } = sub;
  const entitlements = await entitlementsFor(
    deps,
    { merchantId, mode },
    sub.subscription.customer,
    [sub],
  );
  return [
    buildEvent(merchantId, mode, "subscription.created", sub.subscription),
    buildEvent(merchantId, mode, "entitlements.updated", entitlements),
  ];
}

/**
 * Activates the subscription behind a completed checkout: a paid first
 * period (payment, ledger, paid invoice) or, with `data` null, a trial
 * that only saved a card. Runs once — the subscription must be incomplete.
 */
export async function activateSubscription(
  deps: AppDeps,
  stored: StoredCheckoutSession,
  account: string | null,
  saved: SavedMethod | null,
  data: CheckoutCompletedData | null,
): Promise<EventOutcome> {
  const { merchantId, mode, session } = stored;
  const current = session.subscription
    ? await deps.billing.findSubscription(session.subscription)
    : null;
  if (current?.subscription.status !== "incomplete") return "duplicate";
  const { plan, price, interval, count } = await findRecurringPrice(
    deps.catalog,
    { merchantId, mode },
    current.subscription.price,
  );
  const method = await methodRecord(deps, current.subscription.customer, current.provider, saved);
  const now = nowSeconds();
  // No payment means a trial, or a metered price that bills its usage later.
  const trial = data === null && plan.trial_days > 0;
  const periodEnd = trial ? addDays(now, plan.trial_days) : addInterval(now, interval, count);
  const next: StoredSubscription = {
    ...current,
    version: current.version + 1,
    subscription: {
      ...current.subscription,
      status: trial ? "trialing" : "active",
      current_period_start: now,
      current_period_end: periodEnd,
      trial_end: trial ? periodEnd : null,
      payment_method: method?.id ?? null,
    },
  };
  const events = await startEvents(deps, next);
  const base = {
    subscriptions: [{ record: next, expectedVersion: current.version }],
    paymentMethods: method ? [method] : [],
    completeSession: session.id,
  };
  if (!data)
    return (await deps.billing.commit({ ...base, effects: { events } }))
      ? "processed"
      : "duplicate";

  const { payment, posting } = capturedPayment({
    merchantId,
    mode,
    provider: current.provider,
    providerAccountId: account ?? PLATFORM_ACCOUNT,
    providerReference: data.paymentReference,
    amount: data.amount,
    platformFee: money(session.platform_fee, data.amount.currency),
    providerFee: data.providerFee,
    checkoutSession: session.id,
    customerEmail: data.customerEmail,
    metadata: session.metadata,
  });
  const line = subscriptionLine(
    plan.name,
    next.subscription.quantity,
    periodAmount(price, next.subscription.quantity, next.subscription.currency),
    now,
    periodEnd,
  );
  const invoice = paidInvoice(
    openInvoice({
      reason: "subscription_create",
      merchantId,
      mode,
      customer: current.subscription.customer,
      subscription: current.subscription.id,
      total: data.amount,
      lines: [line],
      periodStart: now,
      periodEnd,
    }),
    payment.payment.id,
  );
  const committed = await deps.billing.commit({
    ...base,
    invoices: [{ record: invoice, create: true }],
    payments: [payment],
    effects: {
      ledger: posting,
      events: [
        buildEvent(merchantId, mode, "payment.succeeded", payment.payment),
        buildEvent(merchantId, mode, "invoice.paid", invoice.invoice),
        ...events,
      ],
    },
  });
  return committed ? "processed" : "duplicate";
}
