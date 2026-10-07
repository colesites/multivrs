import { invalidRequest } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { UpdateSubscriptionInput } from "../routes/subscription.schema";
import { findRecurringPrice } from "./billing-helpers";
import { nowSeconds } from "./events";
import { assertLive, loadSubscription, saveChange, scopeOf } from "./subscription.service";
import type { Subscription } from "./subscription.types";
import { chargeUpgrade } from "./subscription-upgrade";

/** Share of the current period still to run, 0…1. */
function remainingShare(s: Subscription, now: number): number {
  const { current_period_start: start, current_period_end: end } = s;
  if (start === null || end === null || end <= start) return 0;
  return Math.min(1, Math.max(0, (end - now) / (end - start)));
}

/**
 * Switches price and/or seats. Upgrades apply now and charge the prorated
 * difference for the rest of the period (no change if the card fails);
 * downgrades wait for the period to end; trials change freely.
 */
export async function changeSubscription(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
  input: UpdateSubscriptionInput,
): Promise<Subscription> {
  const sub = await loadSubscription(deps, merchant, id);
  assertLive(sub);
  const s = sub.subscription;
  const scope = scopeOf(merchant);
  const current = await findRecurringPrice(deps.catalog, scope, s.price);
  const target = input.price ? await findRecurringPrice(deps.catalog, scope, input.price) : current;
  if (target.price.currency !== current.price.currency || target.interval !== current.interval) {
    throw invalidRequest(
      "price_incompatible",
      "Switch to a price with the same currency and interval.",
      "price",
    );
  }
  if (!target.plan.active || !target.price.active) {
    throw invalidRequest("price_inactive", "This price is no longer for sale.", "price");
  }
  const quantity = input.quantity ?? s.quantity;
  if (target.plan.payer === "user" && quantity !== 1) {
    throw invalidRequest("quantity_invalid", "Only organization plans have seats.", "quantity");
  }
  const customer = (await deps.customers.get(merchant.id, merchant.mode, s.customer))?.customer;
  if (customer && customer.type !== target.plan.payer) {
    throw invalidRequest(
      "payer_mismatch",
      `The ${target.plan.key} plan is for ${target.plan.payer}s.`,
      "price",
    );
  }

  const oldAmount = current.price.amount * s.quantity;
  const newAmount = target.price.amount * quantity;
  const next: Subscription = {
    ...s,
    plan: target.plan.id,
    price: target.price.id,
    quantity,
    pending_price: null,
    pending_quantity: null,
  };
  if (newAmount < oldAmount && s.status !== "trialing") {
    return saveChange(
      deps,
      sub,
      { ...s, pending_price: target.price.id, pending_quantity: quantity },
      "subscription.updated",
    );
  }
  const now = nowSeconds();
  const due = Math.round((newAmount - oldAmount) * remainingShare(s, now));
  if (s.status === "trialing" || due <= 0)
    return saveChange(deps, sub, next, "subscription.updated");

  return chargeUpgrade(deps, merchant, sub, next, {
    planName: target.plan.name,
    due,
    currency: target.price.currency,
    now,
  });
}
