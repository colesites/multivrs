import { invalidRequest, minimumCharge, money, newId } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { UsageRecordInput } from "../routes/subscription.schema";
import { findRecurringPrice, periodAmount } from "./billing-helpers";
import { nowSeconds } from "./events";
import { openInvoice, usageLine } from "./invoice-builder";
import { assertLive, loadSubscription } from "./subscription.service";
import type { StoredInvoice, StoredSubscription } from "./subscription.types";
import type { UsageRecord } from "./usage.types";

/** Allowance for the merchant's clock running a little ahead of ours. */
const CLOCK_SKEW_SECONDS = 300;

async function meteredPrice(deps: AppDeps, sub: StoredSubscription) {
  const scope = { merchantId: sub.merchantId, mode: sub.mode };
  const priced = await findRecurringPrice(deps.catalog, scope, sub.subscription.price);
  if (priced.price.usage_type !== "metered") {
    throw invalidRequest(
      "subscription_not_metered",
      "This subscription's price isn't metered, so it has no usage to report.",
      "subscription",
    );
  }
  return { ...priced, aggregate: priced.price.aggregate_usage ?? "sum" };
}

/**
 * `POST /v1/subscriptions/:id/usage_records`: usage for a metered
 * subscription, counted toward the period its timestamp falls in. Only the
 * current period takes new usage; the one that ended is already billed.
 */
export async function reportUsage(
  deps: AppDeps,
  merchant: MerchantContext,
  subscriptionId: string,
  input: UsageRecordInput,
): Promise<UsageRecord> {
  const sub = await loadSubscription(deps, merchant, subscriptionId);
  assertLive(sub);
  await meteredPrice(deps, sub);
  const now = nowSeconds();
  const timestamp = input.timestamp ?? now;
  const start = sub.subscription.current_period_start ?? now;
  if (timestamp < start || timestamp > now + CLOCK_SKEW_SECONDS) {
    throw invalidRequest(
      "timestamp_outside_period",
      "Usage must fall in the subscription's current period, and not in the future.",
      "timestamp",
    );
  }
  const record: UsageRecord = {
    id: newId("usageRecord"),
    object: "usage_record",
    livemode: merchant.mode === "live",
    subscription: subscriptionId,
    quantity: input.quantity,
    timestamp,
  };
  await deps.usage.add({ merchantId: merchant.id, mode: merchant.mode, record });
  return record;
}

/** `GET /v1/subscriptions/:id/usage`: the current period's usage so far and what it costs. */
export async function usageSummary(deps: AppDeps, merchant: MerchantContext, id: string) {
  const sub = await loadSubscription(deps, merchant, id);
  const { price, aggregate } = await meteredPrice(deps, sub);
  const s = sub.subscription;
  // Usage too small to charge last period is still due, so it counts here.
  const from = sub.usageFrom ?? s.current_period_start ?? s.created;
  const to = s.current_period_end ?? nowSeconds();
  const quantity = await deps.usage.total({ subscriptionId: id, from, to, aggregate });
  const unit = periodAmount(price, 1, s.currency);
  return {
    object: "usage_summary" as const,
    subscription: id,
    period_start: from,
    period_end: to,
    aggregate_usage: aggregate,
    quantity,
    unit_amount: unit.amount,
    currency: s.currency,
    /** Trials are free: nothing is due for usage during one. */
    amount_due: s.status === "trialing" ? 0 : unit.amount * quantity,
  };
}

/** What a metered period that just ended bills, and where the next one's unbilled usage starts. */
export interface EndedUsage {
  invoice: StoredInvoice | null;
  /** Null: the next period starts clean. Set: this period's usage carries into the next invoice. */
  usageFrom: number | null;
}

/**
 * The usage of a metered period that just ended, at the price's unit
 * amount, plus any usage carried from before. Below the minimum charge it
 * isn't charged yet but carries into the next period, as on Stripe. Trials
 * are free; licensed prices bill up front instead.
 */
export async function endedPeriodUsage(
  deps: AppDeps,
  sub: StoredSubscription,
): Promise<EndedUsage> {
  const none = { invoice: null, usageFrom: null };
  const { merchantId, mode, subscription: s } = sub;
  const start = s.current_period_start;
  const end = s.current_period_end;
  if (s.status === "trialing" || start === null || end === null) return none;
  const { plan, price } = await findRecurringPrice(deps.catalog, { merchantId, mode }, s.price);
  if (price.usage_type !== "metered") return none;
  const from = sub.usageFrom ?? start;
  const aggregate = price.aggregate_usage ?? "sum";
  const quantity = await deps.usage.total({ subscriptionId: s.id, from, to: end, aggregate });
  if (quantity === 0) return none;
  const unit = periodAmount(price, 1, s.currency);
  const total = money(unit.amount * quantity, unit.currency);
  if (total.amount < minimumCharge(total.currency)) return { invoice: null, usageFrom: from };
  const invoice = openInvoice({
    reason: "subscription_cycle",
    merchantId,
    mode,
    customer: s.customer,
    subscription: s.id,
    total,
    lines: [usageLine(`${plan.name} usage`, quantity, total, from, end)],
    periodStart: from,
    periodEnd: end,
  });
  return { invoice, usageFrom: null };
}
