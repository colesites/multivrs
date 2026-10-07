import type { PriceInterval } from "./catalog.types";
import type { BillingInterval } from "./subscription.types";

/** The longest billing period, as Stripe allows: three years in any unit. */
export const MAX_INTERVAL_COUNT: Record<BillingInterval, number> = {
  day: 1095,
  week: 156,
  month: 36,
  year: 3,
};

const SINGLE: Record<BillingInterval, string> = {
  day: "daily",
  week: "weekly",
  month: "monthly",
  year: "yearly",
};

/** "monthly", "every 3 months", "every 2 weeks". */
export function periodLabel(interval: BillingInterval, count: number): string {
  return count === 1 ? SINGLE[interval] : `every ${count} ${interval}s`;
}

const DAYS_PER_MONTH = 365.25 / 12;
const MONTHS: Record<BillingInterval, number> = {
  day: 1 / DAYS_PER_MONTH,
  week: 7 / DAYS_PER_MONTH,
  month: 1,
  year: 12,
};

/** How many months one charge covers, for monthly recurring revenue. */
export function monthsPerPeriod(price: { interval: PriceInterval; interval_count: number }) {
  return price.interval === "one_time" ? 1 : MONTHS[price.interval] * price.interval_count;
}
