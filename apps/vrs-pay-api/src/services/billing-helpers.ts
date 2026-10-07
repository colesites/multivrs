import {
  type ApiKeyMode,
  CurrencyCodeSchema,
  calculatePlatformFee,
  type Money,
  money,
  resourceMissing,
} from "@vrs-pay/core";
import type { MerchantProfile } from "../app.types";
import type { CatalogStore } from "../stores/catalog.store";
import type { Plan, Price } from "./catalog.types";
import type { BillingInterval } from "./subscription.types";

const DAY_SECONDS = 86_400;

/** The same calendar day next month/year (clamped, e.g. 31 Jan → 28 Feb), in Unix seconds. */
export function addInterval(seconds: number, interval: BillingInterval, count = 1): number {
  const date = new Date(seconds * 1000);
  const day = date.getUTCDate();
  const target = new Date(date);
  target.setUTCDate(1);
  if (interval === "month") target.setUTCMonth(target.getUTCMonth() + count);
  else target.setUTCFullYear(target.getUTCFullYear() + count);
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return Math.floor(target.getTime() / 1000);
}

export function addDays(seconds: number, days: number): number {
  return seconds + days * DAY_SECONDS;
}

export interface PricedPlan {
  plan: Plan;
  price: Price;
  interval: BillingInterval;
}

/** A recurring price and its plan from the merchant's catalog. */
export async function findRecurringPrice(
  catalog: CatalogStore,
  scope: { merchantId: string; mode: ApiKeyMode },
  priceId: string,
): Promise<PricedPlan> {
  const { plans } = await catalog.load(scope);
  for (const plan of plans) {
    const price = plan.prices.find((p) => p.id === priceId);
    if (price && price.interval !== "one_time") return { plan, price, interval: price.interval };
  }
  throw resourceMissing("price", priceId);
}

/** What one period costs: the price times the seats. */
export function periodAmount(price: Price, quantity: number): Money {
  return money(price.amount * quantity, CurrencyCodeSchema.parse(price.currency));
}

export function platformFeeFor(merchant: MerchantProfile, amount: Money): Money {
  return calculatePlatformFee(amount, merchant.platformFeeBps);
}
