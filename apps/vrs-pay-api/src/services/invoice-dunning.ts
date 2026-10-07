import type { AppDeps } from "../app.types";
import { addDays } from "./billing-helpers";
import { entitlementsFor } from "./entitlements.service";
import type { StoredEvent } from "./event.types";
import { buildEvent } from "./events";
import type { StoredInvoice, StoredSubscription } from "./subscription.types";

/** Days after each failed attempt before retrying; then the subscription is canceled. */
export const DUNNING_RETRY_DAYS = [1, 3, 5, 7];
export function withStatus(
  sub: StoredSubscription,
  status: StoredSubscription["subscription"]["status"],
  now: number,
): StoredSubscription {
  const canceled = status === "canceled";
  return {
    ...sub,
    version: sub.version + 1,
    subscription: {
      ...sub.subscription,
      status,
      canceled_at: canceled ? now : sub.subscription.canceled_at,
    },
  };
}

/**
 * A declined (or authentication-needing) attempt: schedule the next retry
 * and mark the subscription past due, or — after the last retry — make the
 * invoice uncollectible and cancel the subscription.
 */
export async function recordDecline(
  deps: AppDeps,
  stored: StoredInvoice,
  sub: StoredSubscription,
  attempt: number,
  now: number,
): Promise<"failed" | "canceled"> {
  const { merchantId, mode, invoice } = stored;
  const waitDays = DUNNING_RETRY_DAYS[attempt - 1];
  const exhausted = waitDays === undefined;
  const failed: StoredInvoice = {
    ...stored,
    invoice: {
      ...invoice,
      attempt_count: attempt,
      status: exhausted ? "uncollectible" : "open",
      next_attempt_at: exhausted ? null : addDays(now, waitDays),
    },
  };
  const status = exhausted ? "canceled" : "past_due";
  // A canceled subscription's last invoice (final usage) is retried, but never revives it.
  const unchanged = sub.subscription.status === status || sub.subscription.status === "canceled";
  const changed = unchanged ? null : withStatus(sub, status, now);
  const events: StoredEvent[] = [
    buildEvent(merchantId, mode, "invoice.payment_failed", failed.invoice),
  ];
  if (changed) {
    events.push(
      buildEvent(
        merchantId,
        mode,
        exhausted ? "subscription.canceled" : "subscription.past_due",
        changed.subscription,
      ),
    );
    if (exhausted) {
      const entitlements = await entitlementsFor(deps, { merchantId, mode }, invoice.customer, [
        changed,
      ]);
      events.push(buildEvent(merchantId, mode, "entitlements.updated", entitlements));
    }
  }
  await deps.billing.commit({
    invoices: [{ record: failed, create: false }],
    subscriptions: changed ? [{ record: changed, expectedVersion: sub.version }] : [],
    effects: { events },
  });
  return exhausted ? "canceled" : "failed";
}
