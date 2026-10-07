/** Currencies without minor units (amounts are already whole). */
const ZERO_DECIMAL = new Set(["jpy"]);

/** Minor units → "£49.00", "₦15,000.00", "¥500". */
export function formatMoney(amount: number, currency: string): string {
  const code = currency.toLowerCase();
  const value = ZERO_DECIMAL.has(code) ? amount : amount / 100;
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code.toUpperCase(),
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code.toUpperCase()}`;
  }
}

interface Period {
  interval: string;
  interval_count: number;
}

/** "One-time", "Monthly", "Every 3 months". */
export function billingLabel({
  interval,
  interval_count: count,
}: Period): string {
  if (interval === "one_time") return "One-time";
  if (count !== 1) return `Every ${count} ${interval}s`;
  return (
    { day: "Daily", week: "Weekly", month: "Monthly", year: "Yearly" }[
      interval
    ] ?? interval
  );
}

/** "$25.00", "$9.00 / month", "$27.00 every 3 months". */
export function formatPrice(
  price: Period & { amount: number; currency: string },
  quantity = 1,
): string {
  const money = formatMoney(price.amount * quantity, price.currency);
  if (price.interval === "one_time") return money;
  return price.interval_count === 1
    ? `${money} / ${price.interval}`
    : `${money} every ${price.interval_count} ${price.interval}s`;
}

/** Unix seconds → "6 Oct 2026". */
export function formatDate(seconds: number | null): string {
  if (seconds === null) return "—";
  return new Date(seconds * 1000).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Unix seconds → "6 Oct, 14:05". */
export function formatDateTime(seconds: number): string {
  return new Date(seconds * 1000).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "sub_A7veVcZ3…" — ids are long; the start is enough to recognise one. */
export function shortId(id: string): string {
  return id.length > 14 ? `${id.slice(0, 12)}…` : id;
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** "12.50" in the currency's major units → minor units (1250). */
export function toMinor(value: string, currency: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(ZERO_DECIMAL.has(currency.toLowerCase()) ? n : n * 100);
}

export function toMajor(amount: number, currency: string): string {
  return ZERO_DECIMAL.has(currency.toLowerCase())
    ? String(amount)
    : (amount / 100).toFixed(2);
}
