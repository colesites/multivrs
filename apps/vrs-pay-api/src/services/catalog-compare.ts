import { isCurrencyCode, newId } from "@vrs-pay/core";
import type { BillingConfig } from "../routes/billing-config.schema";
import type { CatalogChanges, Plan, Price, PriceSlot } from "./catalog.types";

/** The periods a billing config can price; anything else is made in the dashboard or API. */
const CONFIG_INTERVALS = ["month", "year", "one_time"] as const;

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
  return CONFIG_INTERVALS.flatMap((interval) =>
    Object.entries(prices[interval] ?? {}).flatMap(([currency, amount]): PriceSlot[] =>
      amount === undefined || !isCurrencyCode(currency)
        ? []
        : [{ interval, interval_count: 1, currency, amount }],
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
    interval_count: slot.interval === "one_time" ? 1 : slot.interval_count,
    currency: slot.currency.toLowerCase(),
    amount: slot.amount,
    active: true,
    created: now,
  };
}
