"use client";

import { CheckoutElementsProvider } from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DomainCheckoutForm } from "@/features/domains/DomainCheckoutForm";
import {
  CheckoutLoading,
  EmptyCheckout,
  SandboxCheckout,
} from "@/features/domains/DomainCheckoutStates";
import { DomainCheckoutSummary } from "@/features/domains/DomainCheckoutSummary";
import { useDomainCommerce } from "@/features/domains/DomainCommerceProvider";
import {
  createCustomStripeCheckout,
  placeSandboxOrders,
} from "@/features/domains/domain-checkout-api";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface Props {
  sandboxEnabled: boolean;
  user: { email: string; name: string; username: string };
}

export function DomainCheckoutPage({ sandboxEnabled, user }: Props) {
  const router = useRouter();
  const { cartItems, clearCart, hydrated } = useDomainCommerce();
  const [pending, setPending] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutAttempt, setCheckoutAttempt] = useState(0);
  const hostnameKey = cartItems.map((item) => item.domain).join(",");

  useEffect(() => {
    if (!hydrated || !hostnameKey || !stripePromise) return;

    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (!cancelled) {
        setClientSecret(null);
        setCheckoutError("");
      }
    });

    createCustomStripeCheckout(hostnameKey.split(","), checkoutAttempt)
      .then((secret) => {
        if (!cancelled) setClientSecret(secret);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setCheckoutError(
            error instanceof Error
              ? error.message
              : "Unable to prepare checkout",
          );
        }
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [checkoutAttempt, hostnameKey, hydrated]);

  function completeSandboxOrder() {
    if (pending) return;
    setPending(true);
    void placeSandboxOrders(cartItems.map((item) => item.domain))
      .then(() => {
        clearCart();
        toast.success("Sandbox registration completed");
        router.push(`/${user.username}/~/domains`);
      })
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "Checkout failed"),
      )
      .finally(() => setPending(false));
  }

  if (!hydrated) return <CheckoutLoading />;
  if (!cartItems.length) return <EmptyCheckout />;

  return (
    <main className="min-h-screen bg-black px-5 pb-24 pt-24 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/domains"
          className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Back to search
        </Link>
        <h1 className="mt-5 text-4xl font-medium leading-[1.12] tracking-tight">
          Checkout
        </h1>
        {stripePromise && clientSecret ? (
          <CheckoutElementsProvider
            stripe={stripePromise}
            options={{
              clientSecret,
              defaultValues: { email: user.email },
              elementsOptions: { appearance: checkoutAppearance },
            }}
          >
            <DomainCheckoutForm items={cartItems} user={user} />
          </CheckoutElementsProvider>
        ) : stripePromise ? (
          <div className="mt-10 grid items-start gap-5 lg:grid-cols-[1.25fr_0.9fr]">
            <section className="border border-white/12 bg-[#080808] p-5 sm:p-7">
              <div className="flex min-h-72 items-center justify-center">
                {checkoutError ? (
                  <div className="max-w-sm text-center">
                    <p className="text-sm text-red-300">{checkoutError}</p>
                    <button
                      type="button"
                      onClick={() => setCheckoutAttempt((value) => value + 1)}
                      className="mt-5 h-10 border border-white/15 px-5 text-sm font-medium transition-colors hover:bg-white hover:text-black"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-white/45">
                    Preparing secure payment…
                  </p>
                )}
              </div>
            </section>
            <DomainCheckoutSummary items={cartItems} />
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-5 lg:grid-cols-[1.25fr_0.9fr]">
            <section className="border border-white/12 bg-[#080808] p-5 sm:p-7">
              {sandboxEnabled ? (
                <SandboxCheckout
                  pending={pending}
                  onSubmit={completeSandboxOrder}
                />
              ) : (
                <p className="text-sm text-white/55">
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured.
                </p>
              )}
            </section>
            <DomainCheckoutSummary items={cartItems} />
          </div>
        )}
      </div>
    </main>
  );
}

const checkoutAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#ffffff",
    colorBackground: "#0b0b0b",
    colorText: "#f5f5f5",
    colorDanger: "#fca5a5",
    colorTextSecondary: "#8a8a8a",
    borderRadius: "6px",
    fontFamily: "system-ui, sans-serif",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid rgba(255,255,255,0.35)",
      boxShadow: "0 0 0 2px rgba(255,255,255,0.05)",
    },
    ".Tab": {
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "none",
    },
    ".Tab--selected": {
      border: "1px solid rgba(255,255,255,0.45)",
      boxShadow: "none",
    },
  },
};
