import type { AppDeps } from "../app.types";
import { addInterval, findRecurringPrice, periodAmount } from "./billing-helpers";
import { entitlementsFor } from "./entitlements.service";
import type { StoredEvent } from "./event.types";
import { buildEvent } from "./events";
import { openInvoice, subscriptionLine } from "./invoice-builder";
import type { StoredInvoice, StoredSubscription } from "./subscription.types";
import { endedPeriodUsage } from "./usage.service";

/**
 * A subscription whose period (or trial) ended: bill a metered period's
 * usage, then cancel it if asked to, otherwise start the next period —
 * applying any scheduled downgrade — and open its invoice (licensed prices
 * are paid up front). One invoice per period, so this can't double-bill.
 */
export async function renewSubscription(
  deps: AppDeps,
  sub: StoredSubscription,
  now: number,
): Promise<boolean> {
  const { merchantId, mode, subscription: s } = sub;
  const start = s.current_period_end;
  if (start === null) return false;
  const usage = await endedPeriodUsage(deps, sub);
  const usageInvoices = usage.invoice ? [{ record: usage.invoice, create: true }] : [];
  if (s.cancel_at_period_end) {
    const canceled = {
      ...sub,
      version: sub.version + 1,
      subscription: { ...s, status: "canceled" as const, canceled_at: now },
    };
    const entitlements = await entitlementsFor(deps, { merchantId, mode }, s.customer, [canceled]);
    return deps.billing.commit({
      subscriptions: [{ record: canceled, expectedVersion: sub.version }],
      invoices: usageInvoices,
      effects: {
        events: [
          buildEvent(merchantId, mode, "subscription.canceled", canceled.subscription),
          buildEvent(merchantId, mode, "entitlements.updated", entitlements),
        ],
      },
    });
  }
  const priceId = s.pending_price ?? s.price;
  const quantity = s.pending_quantity ?? s.quantity;
  const { plan, price, interval, count } = await findRecurringPrice(
    deps.catalog,
    { merchantId, mode },
    priceId,
  );
  const end = addInterval(start, interval, count);
  const metered = price.usage_type === "metered";
  const renewed: StoredSubscription = {
    ...sub,
    version: sub.version + 1,
    usageFrom: usage.usageFrom,
    subscription: {
      ...s,
      // A metered trial has no up-front invoice to activate it, so it starts here.
      status: metered && s.status === "trialing" ? "active" : s.status,
      plan: plan.id,
      price: price.id,
      quantity,
      pending_price: null,
      pending_quantity: null,
      current_period_start: start,
      current_period_end: end,
    },
  };
  const invoices: Array<{ record: StoredInvoice; create: boolean }> = [...usageInvoices];
  if (!metered) {
    const total = periodAmount(price, quantity, s.currency);
    const record = openInvoice({
      reason: "subscription_cycle",
      merchantId,
      mode,
      customer: s.customer,
      subscription: s.id,
      total,
      lines: [subscriptionLine(plan.name, quantity, total, start, end)],
      periodStart: start,
      periodEnd: end,
    });
    invoices.push({ record, create: true });
  }
  const changedPlan =
    priceId !== s.price || quantity !== s.quantity || renewed.subscription.status !== s.status;
  const events: StoredEvent[] = changedPlan
    ? [buildEvent(merchantId, mode, "subscription.updated", renewed.subscription)]
    : [];
  if (changedPlan) {
    const entitlements = await entitlementsFor(deps, { merchantId, mode }, s.customer, [renewed]);
    events.push(buildEvent(merchantId, mode, "entitlements.updated", entitlements));
  }
  return deps.billing.commit({
    subscriptions: [{ record: renewed, expectedVersion: sub.version }],
    invoices,
    effects: { events },
  });
}
