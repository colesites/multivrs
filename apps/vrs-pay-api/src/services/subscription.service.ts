import { idempotencyError, invalidRequest, resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import { entitlementsFor } from "./entitlements.service";
import type { EventType } from "./event.types";
import { buildEvent, nowSeconds } from "./events";
import type { StoredSubscription, Subscription } from "./subscription.types";

export const scopeOf = (merchant: MerchantContext) => ({
  merchantId: merchant.id,
  mode: merchant.mode,
});

export async function loadSubscription(deps: AppDeps, merchant: MerchantContext, id: string) {
  const sub = await deps.billing.getSubscription(scopeOf(merchant), id);
  if (!sub) throw resourceMissing("subscription", id);
  return sub;
}

/** Writes a subscription change plus its event and the customer's new entitlements. */
export async function saveChange(
  deps: AppDeps,
  current: StoredSubscription,
  next: Subscription,
  type: EventType,
): Promise<Subscription> {
  const { merchantId, mode } = current;
  const record = { ...current, version: current.version + 1, subscription: next };
  const entitlements = await entitlementsFor(deps, { merchantId, mode }, next.customer, [record]);
  const ok = await deps.billing.commit({
    subscriptions: [{ record, expectedVersion: current.version }],
    effects: {
      events: [
        buildEvent(merchantId, mode, type, next),
        buildEvent(merchantId, mode, "entitlements.updated", entitlements),
      ],
    },
  });
  if (!ok)
    throw idempotencyError(
      "subscription_changed",
      "The subscription changed while updating; try again.",
    );
  return next;
}

export function assertLive(sub: StoredSubscription) {
  const { status } = sub.subscription;
  if (status === "canceled" || status === "incomplete") {
    throw invalidRequest("subscription_inactive", `This subscription is ${status}.`, "id");
  }
}

/** Cancels at the end of the period (default; access continues until then) or right away. */
export async function cancelSubscription(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
  at: "period_end" | "now",
) {
  const sub = await loadSubscription(deps, merchant, id);
  assertLive(sub);
  const s = sub.subscription;
  if (at === "now") {
    return saveChange(
      deps,
      sub,
      { ...s, status: "canceled", canceled_at: nowSeconds(), cancel_at_period_end: false },
      "subscription.canceled",
    );
  }
  return saveChange(deps, sub, { ...s, cancel_at_period_end: true }, "subscription.updated");
}

/** Undoes a scheduled cancellation. */
export async function resumeSubscription(deps: AppDeps, merchant: MerchantContext, id: string) {
  const sub = await loadSubscription(deps, merchant, id);
  assertLive(sub);
  if (!sub.subscription.cancel_at_period_end) return sub.subscription;
  return saveChange(
    deps,
    sub,
    { ...sub.subscription, cancel_at_period_end: false },
    "subscription.updated",
  );
}

export async function listSubscriptions(
  deps: AppDeps,
  merchant: MerchantContext,
  customerId?: string,
) {
  return (await deps.billing.listSubscriptions(scopeOf(merchant), customerId)).map(
    (s) => s.subscription,
  );
}
