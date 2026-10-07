import type { AppDeps } from "../app.types";
import { addInterval, findRecurringPrice, periodAmount } from "./billing-helpers";
import { entitlementsFor } from "./entitlements.service";
import type { StoredEvent } from "./event.types";
import { buildEvent } from "./events";
import { openInvoice, subscriptionLine } from "./invoice-builder";
import { collectInvoice } from "./invoice-collection.service";
import type { StoredSubscription } from "./subscription.types";

const BATCH_SIZE = 50;

/**
 * A subscription whose period (or trial) ended: cancel it if asked to,
 * otherwise start the next period — applying any scheduled downgrade — and
 * open its invoice. One invoice per period, so this can't double-bill.
 */
export async function renewSubscription(
  deps: AppDeps,
  sub: StoredSubscription,
  now: number,
): Promise<boolean> {
  const { merchantId, mode, subscription: s } = sub;
  const start = s.current_period_end;
  if (start === null) return false;
  if (s.cancel_at_period_end) {
    const canceled = {
      ...sub,
      version: sub.version + 1,
      subscription: { ...s, status: "canceled" as const, canceled_at: now },
    };
    const entitlements = await entitlementsFor(deps, { merchantId, mode }, s.customer, [canceled]);
    return deps.billing.commit({
      subscriptions: [{ record: canceled, expectedVersion: sub.version }],
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
  const { plan, price, interval } = await findRecurringPrice(
    deps.catalog,
    { merchantId, mode },
    priceId,
  );
  const end = addInterval(start, interval);
  const total = periodAmount(price, quantity);
  const renewed: StoredSubscription = {
    ...sub,
    version: sub.version + 1,
    subscription: {
      ...s,
      plan: plan.id,
      price: price.id,
      quantity,
      pending_price: null,
      pending_quantity: null,
      current_period_start: start,
      current_period_end: end,
    },
  };
  const invoice = openInvoice({
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
  const changedPlan = priceId !== s.price || quantity !== s.quantity;
  const events: StoredEvent[] = changedPlan
    ? [buildEvent(merchantId, mode, "subscription.updated", renewed.subscription)]
    : [];
  if (changedPlan) {
    const entitlements = await entitlementsFor(deps, { merchantId, mode }, s.customer, [renewed]);
    events.push(buildEvent(merchantId, mode, "entitlements.updated", entitlements));
  }
  return deps.billing.commit({
    subscriptions: [{ record: renewed, expectedVersion: sub.version }],
    invoices: [{ record: invoice, create: true }],
    effects: { events },
  });
}

/** One pass of the engine: renew what's due, then charge what's due. */
export async function runBillingCycle(deps: AppDeps, now = new Date()) {
  const at = Math.floor(now.getTime() / 1000);
  let renewed = 0;
  for (const sub of await deps.billing.dueSubscriptions(now, BATCH_SIZE)) {
    if (await renewSubscription(deps, sub, at)) renewed += 1;
  }
  const outcomes = [];
  for (const invoice of await deps.billing.dueInvoices(now, BATCH_SIZE)) {
    outcomes.push(await collectInvoice(deps, invoice, at));
  }
  return { renewed, collected: outcomes };
}

/** Runs the engine every minute, one pass at a time. Returns a stop function. */
export function startBillingWorker(
  deps: AppDeps,
  onError: (error: unknown) => void,
  intervalMs = 60_000,
): () => void {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await runBillingCycle(deps);
    } catch (error) {
      onError(error);
    } finally {
      running = false;
    }
  }, intervalMs);
  return () => clearInterval(timer);
}
