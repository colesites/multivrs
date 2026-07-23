import { Bookmark, ShoppingCart } from "lucide-react";
import type { DomainSearchResult } from "./domain-marketplace";
import { formatDomainPrice } from "./domain-price";

export function DomainResult({
  result,
  featured = false,
  canSave,
  saved,
  onSave,
  onAdd,
}: {
  result: DomainSearchResult;
  featured?: boolean;
  canSave: boolean;
  saved: boolean;
  onSave: (result: DomainSearchResult) => Promise<void>;
  onAdd: (result: DomainSearchResult) => void;
}) {
  const hasPrice =
    typeof result.price === "number" && Number.isFinite(result.price);
  const hasRenewalPrice =
    typeof result.renewalPrice === "number" &&
    Number.isFinite(result.renewalPrice);
  const numericPrice = hasPrice ? result.price : null;
  const numericRenewalPrice = hasRenewalPrice ? result.renewalPrice : null;
  const price =
    numericPrice === null
      ? null
      : formatDomainPrice(numericPrice, result.currency);
  const renewalPrice =
    numericRenewalPrice == null
      ? null
      : formatDomainPrice(numericRenewalPrice, result.currency);
  const discounted =
    numericPrice !== null &&
    numericRenewalPrice != null &&
    numericPrice < numericRenewalPrice;
  return (
    <article
      className={
        featured
          ? "min-h-32 border border-white/12 bg-white/[0.025] p-5"
          : "flex min-h-20 items-center border-b border-r border-white/8 px-4"
      }
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">
            {result.domain}
          </p>
          {result.premium ? (
            <span className="bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-cyan-300">
              Premium
            </span>
          ) : null}
        </div>
        {result.available && price ? (
          <div className="mt-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-white">{price}</span>
              <span className="text-xs text-white/45">first year</span>
              {discounted && renewalPrice ? (
                <span className="text-xs text-white/30 line-through">
                  {renewalPrice}
                </span>
              ) : null}
            </div>
            {renewalPrice ? (
              <p className="mt-1 text-[11px] text-white/35">
                Renews at {renewalPrice}/year
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs text-white/35">Unavailable</p>
        )}
      </div>
      {result.available ? (
        <div className="flex gap-1">
          {canSave ? (
            <button
              type="button"
              onClick={() => void onSave(result)}
              aria-label={
                saved
                  ? `Remove ${result.domain} from saved`
                  : `Save ${result.domain}`
              }
              className="grid size-8 place-items-center text-white/40 hover:text-white"
            >
              <Bookmark
                className="size-4"
                fill={saved ? "currentColor" : "none"}
              />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onAdd(result)}
            aria-label={`Add ${result.domain} to cart`}
            className="grid size-8 place-items-center border border-white/12 text-white/65 hover:bg-white hover:text-black"
          >
            <ShoppingCart className="size-4" />
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function DomainResultSkeleton({
  featured = false,
}: {
  featured?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={
        featured
          ? "min-h-32 animate-pulse border border-white/12 bg-white/[0.025] p-5"
          : "flex min-h-20 animate-pulse items-center border-b border-r border-white/8 px-4"
      }
    >
      <div className="flex-1">
        <div className="h-3.5 w-24 bg-white/8" />
        <div className="mt-3 h-2.5 w-16 bg-white/6" />
      </div>
      <div className="size-8 bg-white/6" />
    </div>
  );
}
