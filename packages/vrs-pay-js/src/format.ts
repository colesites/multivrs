import type { PricingPrice } from "./types";

/** Currencies without minor units. */
const ZERO_DECIMAL = new Set(["jpy"]);

/** Minor units → "£9.00", "₦15,000.00". */
export function formatAmount(amount: number, currency: string, locale?: string): string {
  const code = currency.toLowerCase();
  const value = ZERO_DECIMAL.has(code) ? amount : amount / 100;
  return new Intl.NumberFormat(locale, { style: "currency", currency: code.toUpperCase() }).format(
    value,
  );
}

/** "£9.00", "£9.00 / month", "£27.00 every 3 months", "£0.10 per unit / month". */
export function formatPrice(price: PricingPrice, currency = price.currency, locale?: string) {
  const option = price.currency_options[currency.toLowerCase()];
  // A currency the price isn't sold in falls back to the price's own.
  const money = option
    ? formatAmount(option.amount, currency, locale)
    : formatAmount(price.amount, price.currency, locale);
  const each = price.usage_type === "metered" ? `${money} per unit` : money;
  if (price.interval === "one_time") return each;
  return price.interval_count === 1
    ? `${each} / ${price.interval}`
    : `${each} every ${price.interval_count} ${price.interval}s`;
}
