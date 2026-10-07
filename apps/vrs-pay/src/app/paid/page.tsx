import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/site/logo";

export const metadata = { title: "Payment received" };

/**
 * Where payment links land when the merchant didn't set their own page.
 * `?canceled=1` means the customer backed out of checkout.
 */
export default function PaidPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) {
  const canceled = searchParams?.canceled === "1";
  return (
    <main className="grid min-h-dvh place-items-center bg-white px-6">
      <div className="max-w-sm text-center">
        <a href="/" aria-label="VRS Pay home" className="inline-block">
          <Logo />
        </a>
        {!canceled && (
          <CheckCircle2 className="mx-auto mt-12 size-10 text-emerald-600" />
        )}
        <h1 className="mt-6 text-[2.4rem] leading-[0.98] font-light tracking-[-0.045em] text-ink">
          <span className="font-display text-[1.1em]">
            {canceled ? "No" : "Payment"}
          </span>{" "}
          {canceled ? "payment taken" : "received"}
        </h1>
        <p className="mt-4 text-mute">
          {canceled
            ? "You left checkout before paying. You can go back to the link to try again."
            : "Thanks — your payment went through and a receipt is on its way. You can close this page."}
        </p>
      </div>
    </main>
  );
}
