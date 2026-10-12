"use client";

import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { formatMoney } from "@/components/dashboard/format";

interface HostedSession {
  id: string;
  amount: number;
  currency: string;
  checkout_url?: string | null;
  customer_email?: string | null;
}

/**
 * Checkout for providers that take payment on their own page (Paystack): asks
 * for the buyer's email when the merchant didn't send one, then hands over.
 */
export function HostedCheckout({
  session,
  apiUrl,
}: {
  session: HostedSession;
  apiUrl: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const amount = formatMoney(session.amount, session.currency);

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(
      new FormData(event.currentTarget).get("email") ?? "",
    ).trim();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`${apiUrl}/l/session/${session.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.url) {
        setErrorMessage(
          res.status < 500
            ? (body?.error?.message ??
                "Check your email address and try again.")
            : "We couldn't start the payment right now. Please try again in a moment.",
        );
        setSubmitting(false);
        return;
      }
      window.location.assign(body.url);
    } catch {
      setErrorMessage(
        "We couldn't reach the payment page. Check your connection and try again.",
      );
      setSubmitting(false);
    }
  }

  const footer = (
    <div className="flex items-center justify-center gap-2 text-center text-xs text-mute">
      <ShieldCheck className="size-3.5 text-emerald-600" />
      <span>You'll pay on Paystack's secure page, then come back here.</span>
    </div>
  );

  if (session.checkout_url) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-ink-soft">
          Pay by card, bank transfer or USSD on Paystack's secure page.
          {session.customer_email && (
            <>
              {" "}
              Your receipt goes to{" "}
              <span className="font-medium text-ink">
                {session.customer_email}
              </span>
              .
            </>
          )}
        </p>
        <a
          href={session.checkout_url}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-medium text-white transition-all hover:bg-black hover:shadow-md"
        >
          <Lock className="size-3.5" />
          <span>Pay {amount}</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
        {footer}
      </div>
    );
  }

  return (
    <form onSubmit={start} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="checkout-email"
          className="block text-xs font-medium uppercase tracking-wider text-mute"
        >
          Email
        </label>
        <input
          id="checkout-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-ink shadow-xs outline-none placeholder:text-mute focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
        <p className="text-xs text-mute">Your receipt is sent here.</p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-medium text-white transition-all hover:bg-black hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin text-white" />
            <span>Opening secure payment…</span>
          </>
        ) : (
          <>
            <Lock className="size-3.5" />
            <span>Continue to pay {amount}</span>
          </>
        )}
      </button>
      {footer}
    </form>
  );
}
