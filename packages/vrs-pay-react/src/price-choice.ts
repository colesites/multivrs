import type { PricingPrice, PricingProduct } from "@vrs-pay/js";

/** A billing period a pricing table can switch to, e.g. "month:1" or "month:3". */
export type PeriodKey = string;

const periodOf = (p: PricingPrice): PeriodKey => `${p.interval}:${p.interval_count}`;

const LABELS: Record<string, string> = {
  "day:1": "Daily",
  "week:1": "Weekly",
  "month:1": "Monthly",
  "month:3": "Quarterly",
  "year:1": "Yearly",
};

export function periodLabel(key: PeriodKey): string {
  const [interval = "", count = "1"] = key.split(":");
  return LABELS[key] ?? `Every ${count} ${interval}s`;
}

/** Every recurring period on offer, monthly first when there is one. */
export function periodsOf(products: PricingProduct[]): PeriodKey[] {
  const keys = new Set(
    products.flatMap((p) => p.prices.filter((x) => x.interval !== "one_time").map(periodOf)),
  );
  return [...keys].sort((a, b) =>
    a === "month:1" ? -1 : b === "month:1" ? 1 : a.localeCompare(b),
  );
}

/** The product's price for the chosen period, else its one-time price. */
export function priceFor(product: PricingProduct, period: PeriodKey | null): PricingPrice | null {
  return (
    product.prices.find((p) => period !== null && periodOf(p) === period) ??
    product.prices.find((p) => p.interval === "one_time") ??
    null
  );
}
