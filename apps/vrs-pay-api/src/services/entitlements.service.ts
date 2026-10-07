import type { AppDeps } from "../app.types";
import type { Scope } from "../stores/billing.store";
import type { Entitlements } from "./event.types";
import type { StoredSubscription } from "./subscription.types";

/** Statuses that still grant access (past_due keeps access while we retry). */
const LIVE_STATUSES = new Set(["trialing", "active", "past_due"]);

export function isLive(sub: StoredSubscription): boolean {
  return LIVE_STATUSES.has(sub.subscription.status);
}

/**
 * Merges the features of every live subscription: a boolean is granted if
 * any plan grants it; a limit is the highest any plan gives. `changed`
 * overrides stored subscriptions, so events can describe a write before
 * it's committed.
 */
export async function entitlementsFor(
  deps: AppDeps,
  scope: Scope,
  customerId: string,
  changed: readonly StoredSubscription[] = [],
): Promise<Entitlements> {
  const [stored, { plans }] = await Promise.all([
    deps.billing.listSubscriptions(scope, customerId),
    deps.catalog.load(scope),
  ]);
  const overrides = new Map(changed.map((s) => [s.subscription.id, s]));
  const subscriptions = [
    ...stored.map((s) => overrides.get(s.subscription.id) ?? s),
    ...changed.filter((c) => !stored.some((s) => s.subscription.id === c.subscription.id)),
  ];
  const features: Entitlements["features"] = {};
  const planKeys: string[] = [];
  for (const sub of subscriptions.filter(isLive)) {
    const plan = plans.find((p) => p.id === sub.subscription.plan);
    if (!plan) continue;
    planKeys.push(plan.key);
    for (const [key, value] of Object.entries(plan.features)) {
      const current = features[key];
      if (typeof value === "boolean") features[key] = value || current === true;
      else features[key] = Math.max(value, typeof current === "number" ? current : 0);
    }
  }
  return { object: "entitlements", customer: customerId, plans: planKeys, features };
}

/** Whether `feature` is on: true, or a limit above zero. */
export function grants(entitlements: Entitlements, feature: string): boolean {
  const value = entitlements.features[feature];
  return value === true || (typeof value === "number" && value > 0);
}
