import { ShieldCheck, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { formatMoney } from "@/components/dashboard/format";
import { Logo } from "@/components/site/logo";
import NotFound from "@/app/not-found";
import { CheckoutForm } from "./checkout-form";

export const metadata = {
  title: "Complete your payment · VRS Pay",
  description: "Secure payment checkout powered by VRS Pay",
};

interface SessionData {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  client_secret: string | null;
  status: string;
  provider: string;
  publishable_key: string | null;
  merchant_name: string | null;
  success_url: string;
  cancel_url: string;
  /** Tax is added from the buyer's billing address before they pay. */
  tax_enabled?: boolean;
}

async function getSession(id: string): Promise<SessionData | null> {
  try {
    const res = await fetch(`${apiUrl}/l/session/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as SessionData;
  } catch {
    return null;
  }
}

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await params;
  const session = await getSession(resolvedParams.id);

  if (!session) {
    return <NotFound />;
  }

  const formattedAmount = formatMoney(session.amount, session.currency);

  if (session.status === "complete") {
    return (
      <main className="grid min-h-dvh place-items-center bg-white px-6">
        <div className="max-w-md text-center">
          <Logo />
          <CheckCircle2 className="mx-auto mt-10 size-12 text-emerald-600" />
          <h1 className="mt-6 text-3xl font-light tracking-tight text-ink">
            Payment already completed
          </h1>
          <p className="mt-3 text-sm text-mute">
            This checkout session has already been paid successfully.
          </p>
          <a
            href={session.success_url}
            className="mt-8 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-black"
          >
            Continue to receipt
          </a>
        </div>
      </main>
    );
  }

  if (session.status === "expired") {
    return (
      <main className="grid min-h-dvh place-items-center bg-white px-6">
        <div className="max-w-md text-center">
          <Logo />
          <Clock className="mx-auto mt-10 size-12 text-amber-500" />
          <h1 className="mt-6 text-3xl font-light tracking-tight text-ink">
            Checkout link expired
          </h1>
          <p className="mt-3 text-sm text-mute">
            This payment link is no longer active. Please contact the merchant for a new link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-[#fbfbfe] text-ink antialiased">
      {/* Top bar */}
      <header className="border-b border-line bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="inline-block" aria-label="VRS Pay">
            <Logo />
          </a>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-800">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Encrypted Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-6 py-10 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Order Summary (Left Column) */}
          <section className="lg:col-span-5 space-y-8">
            <div>
              <a
                href={session.cancel_url}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-mute hover:text-ink transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                <span>Cancel and return{session.merchant_name ? ` to ${session.merchant_name}` : ""}</span>
              </a>
              <h1 className="mt-6 text-3xl font-light tracking-tight text-ink sm:text-4xl">
                <span className="font-display italic text-[1.08em] text-brand-600">
                  {session.description ?? "Payment"}
                </span>
              </h1>
              <p className="mt-2 text-sm text-mute">
                Review your order details and pay securely.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-baseline justify-between border-b border-line pb-4">
                <span className="text-sm font-medium text-ink">
                  {session.tax_enabled ? "Subtotal" : "Total due"}
                </span>
                <span className="text-2xl font-semibold tracking-tight text-ink">
                  {formattedAmount}
                </span>
              </div>
              {session.tax_enabled && (
                <p className="text-xs text-mute">
                  Tax is added from your billing address before you pay.
                </p>
              )}

              <div className="space-y-2 text-xs text-mute pt-1">
                {session.merchant_name && (
                  <div className="flex justify-between">
                    <span>Seller</span>
                    <span className="font-medium text-ink">
                      {session.merchant_name}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Currency</span>
                  <span className="font-mono uppercase text-ink">
                    {session.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment rail</span>
                  <span className="text-ink">VRS Pay Global Core</span>
                </div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="rounded-2xl border border-dashed border-line p-5 text-xs text-mute space-y-3">
              <div className="flex items-center gap-2 font-medium text-ink">
                <ShieldCheck className="size-4 text-brand-600" />
                <span>Buyer Protection</span>
              </div>
              <p className="leading-relaxed">
                Your payment is encrypted and routed directly to certified banking rails. Your card data is never stored on VRS Pay servers.
              </p>
            </div>
          </section>

          {/* Payment Form (Right Column) */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-9">
              <h2 className="text-lg font-medium text-ink">
                Payment details
              </h2>
              <p className="mt-1 text-xs text-mute">
                Complete your transaction using your preferred payment method.
              </p>

              <div className="mt-8">
                <CheckoutForm session={session} apiUrl={apiUrl} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
