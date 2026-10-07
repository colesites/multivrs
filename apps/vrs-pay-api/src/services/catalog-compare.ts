import { isCurrencyCode, newId } from "@vrs-pay/core";
import type { BillingConfig } from "../routes/billing-config.schema";
import type { CatalogChanges, Plan, Price, PriceInterval, PriceSlot } from "./catalog.types";

const INTERVALS: readonly PriceInterval[] = ["month", "year", "one_time"];

/** A change set with only the given parts. */
export function catalogChanges(parts: Partial<CatalogChanges> = {}): CatalogChanges {
  return {
    upsertFeatures: [],
    deleteFeatureIds: [],
    upsertPlans: [],
    deactivatePriceIds: [],
    activatePriceIds: [],
    createPrices: [],
    ...parts,
  };
}

/** "custom_domains" → "Custom domains". */
export function nameFromKey(key: string): string {
  const words = key.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function sameFeatures(a: Plan["features"], b: Plan["features"]): boolean {
  const sorted = (f: Plan["features"]) =>
    JSON.stringify(Object.entries(f).sort(([x], [y]) => x.localeCompare(y)));
  return sorted(a) === sorted(b);
}

export function samePlan(a: Plan, b: Plan): boolean {
  return (
    a.name === b.name &&
    a.description === b.description &&
    a.payer === b.payer &&
    a.trial_days === b.trial_days &&
    a.active === b.active &&
    sameFeatures(a.features, b.features)
  );
}

export function slotsOf(prices: BillingConfig["plans"][string]["prices"]): PriceSlot[] {
  return INTERVALS.flatMap((interval) =>
    Object.entries(prices[interval] ?? {}).flatMap(([currency, amount]): PriceSlot[] =>
      amount === undefined || !isCurrencyCode(currency) ? [] : [{ interval, currency, amount }],
    ),
  );
}

export function newPrice(planId: string, slot: PriceSlot, livemode: boolean, now: number): Price {
  return {
    id: newId("price"),
    object: "price",
    livemode,
    plan: planId,
    interval: slot.interval,
    currency: slot.currency.toLowerCase(),
    amount: slot.amount,
    active: true,
    created: now,
  };
}
