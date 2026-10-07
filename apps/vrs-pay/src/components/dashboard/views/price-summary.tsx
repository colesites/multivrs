import { allCurrencies, formatMoney, formatPrice } from "../format";
import type { ProductPrice } from "../types";

/** A price's amount, then its other currencies, description and lookup key. */
export function PriceSummary({ price }: { price: ProductPrice }) {
  const others = allCurrencies(price).slice(1);
  return (
    <div>
      <p className="font-mono text-ink">{formatPrice(price)}</p>
      {others.length > 0 && (
        <p className="font-mono text-xs text-mute">
          Also {others.map((p) => formatMoney(p.amount, p.currency)).join(", ")}
        </p>
      )}
      {price.nickname && (
        <p className="text-xs text-ink-soft">{price.nickname}</p>
      )}
      {price.lookup_key && (
        <p className="font-mono text-[11px] text-mute">{price.lookup_key}</p>
      )}
    </div>
  );
}
