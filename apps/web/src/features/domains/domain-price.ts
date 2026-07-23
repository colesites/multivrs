const FORMATTERS = new Map<string, Intl.NumberFormat>();

export function formatDomainPrice(
  price: number | null | undefined,
  currency: string,
): string {
  if (price == null || !Number.isFinite(price)) return "—";
  let formatter = FORMATTERS.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });
    FORMATTERS.set(currency, formatter);
  }
  return formatter.format(price);
}
