"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Lock, AlertCircle, Loader2 } from "lucide-react";
import { formatMoney } from "@/components/dashboard/format";

declare global {
  interface Window {
    Stripe?: (key: string, options?: Record<string, unknown>) => any;
  }
}

interface SessionData {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  client_secret: string | null;
  status: string;
  provider: string;
  publishable_key: string | null;
  success_url: string;
  cancel_url: string;
  tax_enabled?: boolean;
}

interface TaxQuote {
  subtotal: number;
  tax: number;
  total: number;
}

interface StripeAddressChange {
  complete: boolean;
  value: {
    address: {
      country: string;
      postal_code?: string | null;
      state?: string | null;
      city?: string | null;
      line1?: string | null;
      line2?: string | null;
    };
  };
}

let stripeScriptPromise: Promise<void> | null = null;
function loadStripeScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Stripe) return Promise.resolve();
  if (!stripeScriptPromise) {
    stripeScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Failed to load Stripe.js")));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Stripe.js"));
      document.head.appendChild(script);
    });
  }
  return stripeScriptPromise;
}

export function CheckoutForm({
  session,
  apiUrl,
}: {
  session: SessionData;
  apiUrl: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quote, setQuote] = useState<TaxQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const lastAddress = useRef("");
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteRun = useRef(0);

  const publishableKey = session.publishable_key;
  const taxed = session.tax_enabled === true;
  // A SetupIntent saves the card for a trial; nothing is charged now.
  const isSetup = session.client_secret?.startsWith("seti_") ?? false;

  /** Prices the tax for the buyer's address and refreshes the Payment Element's amount. */
  async function quoteTax(address: StripeAddressChange["value"]["address"]) {
    const run = ++quoteRun.current;
    setQuoting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${apiUrl}/l/session/${session.id}/tax`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            country: address.country,
            postal_code: address.postal_code ?? undefined,
            state: address.state ?? undefined,
            city: address.city ?? undefined,
            line1: address.line1 ?? undefined,
            line2: address.line2 ?? undefined,
          },
        }),
      });
      const body = await res.json();
      if (run !== quoteRun.current) return;
      if (!res.ok) {
        setQuote(null);
        // Address problems are the buyer's to fix; anything else is ours.
        setErrorMessage(
          res.status < 500
            ? (body?.error?.message ?? "We couldn't work out tax for this address.")
            : "We couldn't work out tax right now. Please try again in a moment.",
        );
        return;
      }
      await elementsRef.current?.fetchUpdates();
      if (run === quoteRun.current) setQuote(body as TaxQuote);
    } catch {
      if (run === quoteRun.current) setErrorMessage("We couldn't work out tax. Try again.");
    } finally {
      if (run === quoteRun.current) setQuoting(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Stripe Elements mount once per client secret; quoteTax only reads refs and state setters.
  useEffect(() => {
    let unmounted = false;

    if (!session.client_secret || !publishableKey) {
      setLoading(false);
      return;
    }

    loadStripeScript()
      .then(() => {
        if (unmounted || !containerRef.current || !window.Stripe) return;

        const stripe = window.Stripe(publishableKey);
        stripeRef.current = stripe;

        const elements = stripe.elements({
          clientSecret: session.client_secret,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#6936f5",
              colorBackground: "#ffffff",
              colorText: "#0b0b12",
              colorDanger: "#ef4444",
              fontFamily: "Geist, system-ui, -apple-system, sans-serif",
              borderRadius: "8px",
              fontSizeBase: "14px",
            },
            rules: {
              ".Input": {
                border: "1px solid #e9e9f0",
                boxShadow: "0 1px 2px rgba(11, 11, 18, 0.04)",
                padding: "10px 12px",
              },
              ".Input:focus": {
                borderColor: "#6936f5",
                boxShadow: "0 0 0 1px #6936f5",
              },
              ".Tab": {
                border: "1px solid #e9e9f0",
                backgroundColor: "#fcfcff",
              },
              ".Tab--selected": {
                borderColor: "#6936f5",
                backgroundColor: "#ffffff",
              },
            },
          },
        });
        elementsRef.current = elements;

        const paymentElement = elements.create("payment", {
          layout: "tabs",
        });

        paymentElement.mount(containerRef.current);
        paymentElement.on("ready", () => {
          if (!unmounted) setLoading(false);
        });

        if (taxed && addressRef.current) {
          const addressElement = elements.create("address", { mode: "billing" });
          addressElement.mount(addressRef.current);
          addressElement.on("change", (event: StripeAddressChange) => {
            if (!event.complete) {
              lastAddress.current = "";
              setQuote(null);
              return;
            }
            const key = JSON.stringify(event.value.address);
            if (key === lastAddress.current) return;
            lastAddress.current = key;
            if (quoteTimer.current) clearTimeout(quoteTimer.current);
            quoteTimer.current = setTimeout(() => quoteTax(event.value.address), 350);
          });
        }
      })
      .catch((err) => {
        if (!unmounted) {
          setLoading(false);
          setErrorMessage(err instanceof Error ? err.message : "Failed to load payment processor");
        }
      });

    return () => {
      unmounted = true;
      if (quoteTimer.current) clearTimeout(quoteTimer.current);
    };
  }, [session.client_secret, publishableKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stripe = stripeRef.current;
    const elements = elementsRef.current;
    if (!stripe || !elements) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const confirm = isSetup ? stripe.confirmSetup : stripe.confirmPayment;
      const { error } = await confirm({
        elements,
        confirmParams: {
          return_url: session.success_url,
        },
      });

      if (error) {
        setErrorMessage(error.message ?? "An unexpected payment error occurred.");
        setSubmitting(false);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to process payment.");
      setSubmitting(false);
    }
  };

  const formattedAmount = formatMoney(quote?.total ?? session.amount, session.currency);
  // With tax on, the buyer can't pay until their address has priced it.
  const awaitingTax = taxed && (quoting || quote === null);

  if (!session.client_secret) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Missing payment client secret for this checkout session.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <label className="block text-xs font-medium uppercase tracking-wider text-mute">
          Payment Method
        </label>
        <div className="relative rounded-xl border border-line bg-white p-4 shadow-xs">
          {loading && (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-ink/40" />
            </div>
          )}
          <div ref={containerRef} className={loading ? "hidden" : "block"} />
        </div>
      </div>

      {taxed && (
        <div className="space-y-4">
          <p className="block text-xs font-medium uppercase tracking-wider text-mute">
            Billing address
          </p>
          <div className="rounded-xl border border-line bg-white p-4 shadow-xs">
            <div ref={addressRef} />
          </div>
        </div>
      )}

      {taxed && quote && !isSetup && (
        <dl className="space-y-1.5 rounded-xl border border-line bg-[#fcfcff] p-4 text-sm">
          <div className="flex justify-between text-mute">
            <dt>Subtotal</dt>
            <dd>{formatMoney(quote.subtotal, session.currency)}</dd>
          </div>
          <div className="flex justify-between text-mute">
            <dt>Tax</dt>
            <dd>{formatMoney(quote.tax, session.currency)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5 font-medium text-ink">
            <dt>Total</dt>
            <dd>{formatMoney(quote.total, session.currency)}</dd>
          </div>
        </dl>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || submitting || awaitingTax}
        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-medium text-white transition-all hover:bg-black hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin text-white" />
            <span>Processing secure payment…</span>
          </>
        ) : (
          <>
            <Lock className="size-3.5 transition-transform group-hover:scale-110" />
            <span>
              {isSetup
                ? "Save payment method"
                : taxed && !quote
                  ? quoting
                    ? "Calculating tax…"
                    : "Enter your billing address"
                  : `Pay ${formattedAmount}`}
            </span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-center text-xs text-mute">
        <ShieldCheck className="size-3.5 text-emerald-600" />
        <span>256-bit encrypted • PCI DSS SAQ A compliant checkout</span>
      </div>
    </form>
  );
}
