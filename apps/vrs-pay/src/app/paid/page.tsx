"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Info } from "lucide-react";
import { Logo } from "@/components/site/logo";

export default function PaidPage() {
  const [params, setParams] = useState<{
    isCanceled: boolean;
    isProcessing: boolean;
    isSucceeded: boolean;
    merchant: string | null;
    link: string | null;
    paymentIntent: string | null;
  } | null>(null);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const redirectStatus = search.get("redirect_status");
    const canceledParam = search.get("canceled");
    const paymentIntent = search.get("payment_intent");
    const merchant = search.get("merchant");
    const link = search.get("link");

    const isCanceled =
      canceledParam === "1" ||
      redirectStatus === "failed" ||
      redirectStatus === "requires_payment_method";
    const isProcessing = redirectStatus === "processing";
    const isSucceeded = redirectStatus === "succeeded" || (!isCanceled && !isProcessing && !!paymentIntent);

    setParams({
      isCanceled,
      isProcessing,
      isSucceeded,
      merchant,
      link,
      paymentIntent,
    });
  }, []);

  const merchantName = params?.merchant;

  return (
    <main className="grid min-h-dvh place-items-center bg-[#fbfbfe] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 sm:p-10 text-center shadow-xs">
        <div className="inline-block">
          <Logo />
        </div>

        {params?.isCanceled ? (
          <>
            <XCircle className="mx-auto mt-10 size-12 text-rose-500" />
            <h1 className="mt-6 text-3xl font-light tracking-tight text-ink">
              <span className="font-display italic text-[1.1em]">Payment</span> canceled
            </h1>
            <p className="mt-4 text-sm text-mute leading-relaxed">
              No charge was made{merchantName ? ` by ${merchantName}` : ""}. You can return to your checkout whenever you're ready to complete the payment.
            </p>
            <div className="mt-6">
              <a
                href={params.link ?? "#"}
                onClick={
                  !params.link
                    ? (e) => {
                        e.preventDefault();
                        window.history.back();
                      }
                    : undefined
                }
                className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-xs font-medium text-white transition-all hover:bg-black"
              >
                ← Try checkout again
              </a>
            </div>
          </>
        ) : params?.isProcessing ? (
          <>
            <Clock className="mx-auto mt-10 size-12 text-amber-500" />
            <h1 className="mt-6 text-3xl font-light tracking-tight text-ink">
              <span className="font-display italic text-[1.1em]">Payment</span> processing
            </h1>
            <p className="mt-4 text-sm text-mute leading-relaxed">
              Your payment is currently being authorized by your bank. We will notify you once confirmation is received.
            </p>
          </>
        ) : params?.isSucceeded ? (
          <>
            <CheckCircle2 className="mx-auto mt-10 size-12 text-emerald-600" />
            <h1 className="mt-6 text-3xl font-light tracking-tight text-ink">
              <span className="font-display italic text-[1.1em]">Payment</span> received
            </h1>
            <p className="mt-4 text-sm text-mute leading-relaxed">
              Thank you — your transaction{merchantName ? ` with ${merchantName}` : ""} has been completed securely and your receipt has been dispatched.
            </p>
            {params.paymentIntent && (
              <div className="mt-6 rounded-xl border border-line bg-wash p-3 text-xs text-mute font-mono">
                Ref: {params.paymentIntent}
              </div>
            )}
            <p className="mt-6 text-xs text-mute">
              You may safely close this window.
            </p>
          </>
        ) : (
          <>
            <Info className="mx-auto mt-10 size-12 text-mute" />
            <h1 className="mt-6 text-3xl font-light tracking-tight text-ink">
              <span className="font-display italic text-[1.1em]">Payment</span> status
            </h1>
            <p className="mt-4 text-sm text-mute leading-relaxed">
              No recent payment was initiated or this link has already completed.
            </p>
          </>
        )}

        <div className="mt-8 border-t border-line pt-6">
          <div className="flex items-center justify-center gap-1.5 text-xs text-mute">
            <span>Powered by</span>
            <a
              href="/"
              className="font-medium text-ink hover:text-brand-600 transition-colors"
            >
              VRS Pay
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
