"use client";

import { Bookmark, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { formatDomainPrice } from "./domain-price";
import { useResponsiveSheetSide } from "./use-responsive-sheet-side";

export function DomainCartSheet() {
  const router = useRouter();
  const side = useResponsiveSheetSide();
  const {
    cartItems,
    cartOpen,
    isSignedIn,
    moveCartToSaved,
    removeFromCart,
    setCartOpen,
  } = useDomainCommerce();

  function signInToCheckout() {
    setCartOpen(false);
    router.push(buildSignInHref("/domains/checkout"));
  }

  function continueToCheckout() {
    if (!cartItems.length) return;
    setCartOpen(false);
    router.push("/domains/checkout");
  }

  const currency = cartItems[0]?.currency ?? "USD";
  const sameCurrency = cartItems.every((item) => item.currency === currency);
  const total = sameCurrency
    ? formatDomainPrice(
        cartItems.reduce((sum, item) => sum + (item.price ?? 0), 0),
        currency,
      )
    : "Calculated at checkout";

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side={side}
        className="h-[82dvh] rounded-t-2xl border-border bg-background p-0 text-foreground md:h-full md:w-[440px] md:max-w-[440px] md:rounded-none"
      >
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-clash text-xl text-foreground">
            Your cart
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your selected domains and continue to checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {cartItems.length ? (
            <div className="divide-y divide-border">
              {cartItems.map((item) => (
                <div
                  key={item.domain}
                  className="flex items-start gap-4 px-6 py-5"
                >
                  <div className="grid size-10 shrink-0 place-items-center border border-border bg-muted">
                    <ShoppingCart className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-clash text-lg font-medium">
                      {item.domain}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Renews at{" "}
                      {formatDomainPrice(item.renewalPrice, item.currency)}/year
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatDomainPrice(item.price, item.currency)}
                    </p>
                    <div className="mt-3 flex items-center justify-end">
                      {isSignedIn ? (
                        <button
                          type="button"
                          onClick={() => {
                            void moveCartToSaved(item)
                              .then(() =>
                                toast.success(`${item.domain} moved to saved`),
                              )
                              .catch(() =>
                                toast.error(
                                  "The domain could not be moved to saved.",
                                ),
                              );
                          }}
                          className="inline-grid size-8 place-items-center text-muted-foreground hover:text-foreground"
                          aria-label={`Move ${item.domain} to saved domains`}
                        >
                          <Bookmark className="size-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.domain)}
                        className="inline-grid size-8 place-items-center text-muted-foreground hover:text-red-500"
                        aria-label={`Remove ${item.domain} from cart`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid h-full min-h-64 place-items-center px-6 text-center">
              <div>
                <ShoppingCart className="mx-auto size-7 text-muted-foreground/50" />
                <p className="mt-4 font-medium">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add an available domain from the search results.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-muted/50 p-6">
          <div className="mb-5 flex items-center justify-between text-lg">
            <span>Total</span>
            <span className="font-semibold">
              {cartItems.length ? total : "—"}
            </span>
          </div>
          <button
            type="button"
            disabled={!cartItems.length}
            onClick={isSignedIn ? continueToCheckout : signInToCheckout}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MultivrsMark className="size-4" />
            {isSignedIn ? "Continue to checkout" : "Sign in to checkout"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
