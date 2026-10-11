import type { PricingPrice, PricingProduct } from "./types";

export type PeriodKey = "month:1" | "year:1" | "week:1" | "day:1" | "one_time";

export function periodLabel(key: PeriodKey): string {
  switch (key) {
    case "month:1":
      return "Monthly";
    case "year:1":
      return "Yearly";
    case "week:1":
      return "Weekly";
    case "day:1":
      return "Daily";
    case "one_time":
      return "One-off";
  }
}

export function priceFor(
  product: PricingProduct,
  period: PeriodKey | null,
  currency?: string,
): PricingPrice | null {
  const match = product.prices.find((p) => {
    if (period === "one_time") return p.interval === "one_time";
    if (!period) return true;
    const [int, count] = period.split(":");
    return p.interval === int && p.interval_count === Number(count);
  });
  return match ?? product.prices[0] ?? null;
}

export function formatPrice(price: PricingPrice, currency = price.currency): string {
  const amount = price.amount;
  const curr = currency.toUpperCase();
  const symbol = curr === "USD" ? "$" : curr === "EUR" ? "€" : curr === "GBP" ? "£" : `${curr} `;
  const formatted = amount === 0 ? "Free" : `${symbol}${(amount / 100).toFixed(amount % 100 === 0 ? 0 : 2)}`;
  if (price.interval === "one_time") return formatted;
  const count = price.interval_count;
  return count === 1 ? `${formatted} / ${price.interval}` : `${formatted} every ${count} ${price.interval}s`;
}
