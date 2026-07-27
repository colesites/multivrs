"use client";

import {
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { CreditCard, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DomainBillingFields,
  type DomainBillingState,
} from "@/features/domains/DomainBillingFields";
import { DomainCheckoutSummary } from "@/features/domains/DomainCheckoutSummary";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";

export function DomainCheckoutForm({
  items,
  user,
}: {
  items: DomainSearchResult[];
  user: { email: string; name: string };
}) {
  const checkoutState = useCheckoutElements();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [billing, setBilling] = useState(() => initialBilling(user));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkoutState.type !== "success") return;
    setPending(true);
    setError("");
    try {
      const result = await checkoutState.checkout.confirm({
        redirect: "if_required",
        email: billing.email,
        phoneNumber: billing.phone,
        billingAddress: {
          name: `${billing.firstName} ${billing.lastName}`.trim(),
          address: {
            country: billing.country,
            line1: billing.line1,
            line2: billing.line2 || null,
            city: billing.city,
            state: billing.state,
            postal_code: billing.postalCode,
          },
        },
      });
      if (result.type === "error") {
        setError(result.error.message);
        setPending(false);
        return;
      }
      router.push(`/domains/order/success?session_id=${result.session.id}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Payment could not be completed",
      );
      setPending(false);
    }
  }

  const checkoutError =
    checkoutState.type === "error" ? checkoutState.error.message : error;

  return (
    <form
      id="domain-purchase-form"
      onSubmit={submit}
      className="mt-10 grid items-start gap-5 lg:grid-cols-[1.25fr_0.9fr]"
    >
      <section className="border border-white/12 bg-[#080808] p-5 sm:p-7">
        <div className="mb-7 border-b border-white/10 pb-6">
          <h2 className="text-lg font-semibold">Billing information</h2>
          <p className="mt-2 text-sm text-white/45">
            Used for payment verification and domain registration.
          </p>
        </div>
        <DomainBillingFields value={billing} onChange={setBilling} />
        <div className="my-7 border-t border-white/10" />
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="size-4 text-white/45" />
          <h2 className="text-lg font-semibold">Payment method</h2>
        </div>
        <div className="rounded-md border border-white/12 bg-[#0b0b0b] p-3">
          <PaymentElement
            options={{
              layout: { type: "tabs", defaultCollapsed: false },
              fields: { billingDetails: "never" },
            }}
          />
        </div>
        {checkoutState.type === "loading" ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-white/40">
            <LoaderCircle className="size-4 animate-spin" />
            Preparing secure payment…
          </p>
        ) : null}
        {checkoutError ? (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {checkoutError}
          </p>
        ) : null}
      </section>
      <DomainCheckoutSummary
        items={items}
        submitting={pending}
        checkoutReady={checkoutState.type === "success"}
      />
    </form>
  );
}

function initialBilling(user: { email: string; name: string }) {
  const names = user.name.trim().split(/\s+/);
  return {
    firstName: names[0] ?? "",
    lastName: names.slice(1).join(" "),
    email: user.email,
    company: "",
    country: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  } satisfies DomainBillingState;
}
