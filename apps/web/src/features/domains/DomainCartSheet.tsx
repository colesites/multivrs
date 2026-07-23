"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { MultivrsMark } from "@/components/brand/Logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { buildSignInHref } from "@/lib/auth/return-path";
import { useDomainCommerce } from "./DomainCommerceProvider";
import type { DomainSearchResult } from "./domain-marketplace";
import { formatDomainPrice } from "./domain-price";
import { useResponsiveSheetSide } from "./use-responsive-sheet-side";

export function DomainCartSheet({
  onCheckout,
}: {
  onCheckout: (result: DomainSearchResult) => void;
}) {
  const router = useRouter();
  const side = useResponsiveSheetSide();
  const { cartItem, cartOpen, isSignedIn, removeFromCart, setCartOpen } =
    useDomainCommerce();

  function signInToCheckout() {
    const returnUrl = new URL(window.location.href);
    returnUrl.searchParams.set("checkout", "1");
    setCartOpen(false);
    router.push(
      buildSignInHref(
        `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`,
      ),
    );
  }

  function continueToCheckout() {
    if (!cartItem) return;
    setCartOpen(false);
    onCheckout(cartItem);
  }

  const price = cartItem
    ? formatDomainPrice(cartItem.price, cartItem.currency)
    : "—";
  const renewal = cartItem
    ? formatDomainPrice(cartItem.renewalPrice, cartItem.currency)
    : "—";

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side={side}
        className="h-[82dvh] rounded-t-2xl border-white/12 bg-[#080808] p-0 text-white md:h-full md:w-[440px] md:max-w-[440px] md:rounded-none"
      >
        <SheetHeader className="border-b border-white/10 px-6 py-5">
          <SheetTitle className="font-clash text-xl text-white">
            Your cart
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your selected domain and continue to checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {cartItem ? (
            <div className="flex items-start gap-4 px-6 py-7">
              <div className="grid size-10 shrink-0 place-items-center border border-white/10 bg-white/[0.03]">
                <ShoppingCart className="size-4 text-white/45" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-clash text-lg font-medium">
                  {cartItem.domain}
                </p>
                <p className="mt-1 text-sm text-white/40">
                  Renews at {renewal}/year
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{price}</p>
                <button
                  type="button"
                  onClick={removeFromCart}
                  className="mt-3 inline-grid size-8 place-items-center text-white/35 hover:text-red-300"
                  aria-label={`Remove ${cartItem.domain} from cart`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid h-full min-h-64 place-items-center px-6 text-center">
              <div>
                <ShoppingCart className="mx-auto size-7 text-white/25" />
                <p className="mt-4 font-medium">Your cart is empty</p>
                <p className="mt-1 text-sm text-white/40">
                  Add an available domain from the search results.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-black/50 p-6">
          <div className="mb-5 flex items-center justify-between text-lg">
            <span>Total</span>
            <span className="font-semibold">{cartItem ? price : "—"}</span>
          </div>
          <button
            type="button"
            disabled={!cartItem}
            onClick={isSignedIn ? continueToCheckout : signInToCheckout}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-white font-medium text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MultivrsMark className="size-4" />
            {isSignedIn ? "Continue to checkout" : "Sign in to checkout"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
