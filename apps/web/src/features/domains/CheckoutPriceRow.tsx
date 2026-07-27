import type { DomainSearchResult } from "@/features/domains/domain-marketplace";

const CURRENCY_FORMATTERS = new Map<string, Intl.NumberFormat>();

function formatPrice(amount: number, currency: string): string {
  let formatter = CURRENCY_FORMATTERS.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
    CURRENCY_FORMATTERS.set(currency, formatter);
  }
  return formatter.format(amount);
}

export function CheckoutPriceRow({
  result,
  sandbox,
}: {
  result: DomainSearchResult;
  sandbox: boolean;
}) {
  const price =
    result.price === null ? "—" : formatPrice(result.price, result.currency);
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/55">
        {sandbox ? "Test total" : "Due today"}
      </span>
      <div className="text-right">
        {sandbox ? (
          <span className="mr-2 text-xs text-white/30 line-through">
            {price}
          </span>
        ) : null}
        <span className="text-lg font-semibold">
          {sandbox ? "$0.00" : price}
        </span>
      </div>
    </div>
  );
}
