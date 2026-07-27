import { Globe2, LoaderCircle, LockKeyhole } from "lucide-react";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";
import { formatDomainPrice } from "@/features/domains/domain-price";

export function DomainCheckoutSummary({
  items,
  submitting = false,
  checkoutReady = false,
}: {
  items: DomainSearchResult[];
  submitting?: boolean;
  checkoutReady?: boolean;
}) {
  const currency = items[0]?.currency ?? "USD";
  const sameCurrency = items.every((item) => item.currency === currency);
  const total = sameCurrency
    ? formatDomainPrice(
        items.reduce((sum, item) => sum + (item.price ?? 0), 0),
        currency,
      )
    : "Calculated by Stripe";

  return (
    <aside className="border border-white/12 bg-[#080808] lg:sticky lg:top-24">
      <div className="divide-y divide-white/10">
        {items.map((item) => (
          <div key={item.domain} className="flex gap-4 p-5">
            <div className="grid size-10 shrink-0 place-items-center border border-white/10 bg-white/[0.03]">
              <Globe2 className="size-4 text-white/45" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{item.domain}</p>
              <p className="mt-1 text-xs text-white/40">
                Renews yearly at{" "}
                {formatDomainPrice(item.renewalPrice, item.currency)}
              </p>
            </div>
            <p className="font-medium text-white">
              {formatDomainPrice(item.price, item.currency)}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-5">
        <div className="flex items-center justify-between text-lg">
          <span>Total</span>
          <span className="font-semibold">{total}</span>
        </div>
        <p className="mt-2 text-right text-xs text-white/35">
          Plus applicable taxes and fees
        </p>
      </div>
      <div className="flex gap-2 border-t border-white/10 p-5 text-xs leading-5 text-white/40">
        <LockKeyhole className="mt-0.5 size-4 shrink-0" />
        <p>
          Domains are non-refundable. Verify spelling and registration details
          before purchase.
        </p>
      </div>
      <div className="border-t border-white/10 p-5">
        <button
          type="submit"
          disabled={!checkoutReady || submitting}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {submitting ? "Processing…" : "Buy"}
        </button>
        <p className="mt-3 text-center text-[11px] leading-4 text-white/30">
          Payment is securely processed by Stripe.
        </p>
      </div>
    </aside>
  );
}
