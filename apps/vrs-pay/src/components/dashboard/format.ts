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

/** "$25.00" for a one-time price, "$9.00 / month" for a recurring one. */
export function formatPrice(price: {
  amount: number;
  currency: string;
  interval: string;
}): string {
  const money = formatMoney(price.amount, price.currency);
  return price.interval === "one_time" ? money : `${money} / ${price.interval}`;
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
