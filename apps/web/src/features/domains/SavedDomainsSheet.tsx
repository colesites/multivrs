"use client";

import { Bookmark, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDomainCommerce } from "./DomainCommerceProvider";
import { formatDomainPrice } from "./domain-price";
import { useResponsiveSheetSide } from "./use-responsive-sheet-side";

export function SavedDomainsSheet() {
  const side = useResponsiveSheetSide();
  const {
    moveSavedToCart,
    savedDomains,
    savedOpen,
    setSavedOpen,
    toggleSaved,
  } = useDomainCommerce();

  return (
    <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
      <SheetContent
        side={side}
        className="h-[82dvh] rounded-t-2xl border-white/12 bg-[#080808] p-0 text-white md:h-full md:w-[440px] md:max-w-[440px] md:rounded-none"
      >
        <SheetHeader className="border-b border-white/10 px-6 py-5">
          <SheetTitle className="font-clash text-xl text-white">
            Saved domains
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review domains saved to your account.
          </SheetDescription>
        </SheetHeader>
        {savedDomains.length ? (
          <div className="min-h-0 flex-1 divide-y divide-white/8 overflow-y-auto">
            {savedDomains.map((result) => (
              <div
                key={result.domain}
                className="flex items-center gap-4 px-6 py-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{result.domain}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {formatDomainPrice(result.price, result.currency)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void moveSavedToCart(result)
                      .then(() =>
                        toast.success(`${result.domain} moved to cart`),
                      )
                      .catch(() =>
                        toast.error("The domain could not be moved to cart."),
                      );
                  }}
                  className="grid size-9 place-items-center border border-white/12 text-white/65 hover:bg-white hover:text-black"
                  aria-label={`Move ${result.domain} to cart`}
                >
                  <ShoppingCart className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void toggleSaved(result).catch(() =>
                      toast.error("Saved domains could not be updated."),
                    );
                  }}
                  className="grid size-9 place-items-center text-white/35 hover:text-red-300"
                  aria-label={`Remove ${result.domain} from saved domains`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-80 flex-1 place-items-center px-8 text-center">
            <div>
              <Bookmark className="mx-auto size-8 text-white/25" />
              <p className="mt-5 font-medium">No saved domains</p>
              <p className="mt-2 text-sm leading-6 text-white/40">
                Save an available result and it will appear here.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
