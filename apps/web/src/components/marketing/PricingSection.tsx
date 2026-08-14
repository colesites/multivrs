"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import CursorGrid from "@/components/CursorGrid";
import { PricingCard } from "@/components/marketing/PricingCard";
import {
  ENTERPRISE_FEATURES,
  iconForPricingFeature,
} from "@/components/marketing/pricing-plans";
import { startSubscriptionCheckout } from "@/features/billing/subscription-checkout-api";
import { authClient } from "@/lib/auth-client";
import type { StripePlan } from "@/lib/payments/pricing";

export function PricingSection({
  hobbyPlan,
  proPlan,
}: {
  hobbyPlan: StripePlan;
  proPlan: StripePlan;
}) {
  const router = useRouter();
  const [checkoutPending, setCheckoutPending] = useState(false);
  const { data: session } = authClient.useSession();

  function handleProAction() {
    if (!proPlan.configured) {
      router.push("/contact/sales");
      return;
    }
    if (!session?.user) {
      router.push("/signup?next=/pricing");
      return;
    }
    setCheckoutPending(true);
    void startSubscriptionCheckout()
      .then((url) => window.location.assign(url))
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : "Unable to start checkout",
        );
        setCheckoutPending(false);
      });
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background pb-24 pt-28 text-foreground lg:pb-32 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <CursorGrid
          cellSize={65}
          color="#A855F7"
          radius={160}
          falloff="smooth"
          holdTime={400}
          fadeDuration={700}
          lineWidth={1}
          maxOpacity={0.6}
          gridOpacity={0.06}
          className="pointer-events-auto"
        />
      </div>
      <div className="marketing-container relative z-10">
        <div className="mb-12 max-w-3xl lg:mb-16">
          <h1 className="text-4xl font-medium leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            Start simply.
            <br />
            Scale without surprises.
          </h1>
        </div>
        <div className="grid grid-cols-1 divide-y divide-border border border-border bg-background shadow-2xl lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <PricingCard
            title={hobbyPlan.name}
            price={hobbyPlan.priceLabel}
            suffix={hobbyPlan.priceSuffix}
            description={hobbyPlan.description}
            features={hobbyPlan.features.map((text) => ({
              text,
              icon: iconForPricingFeature(text),
            }))}
            action={hobbyPlan.configured ? "Start building" : "Contact us"}
            onAction={() =>
              router.push(hobbyPlan.configured ? "/signup" : "/contact/sales")
            }
          />
          <PricingCard
            title={proPlan.name}
            eyebrow="Popular"
            price={proPlan.priceLabel}
            suffix={proPlan.priceSuffix}
            description={proPlan.description}
            featureIntro="All Hobby features, plus:"
            features={proPlan.features.map((text) => ({
              text,
              icon: iconForPricingFeature(text),
            }))}
            action={
              checkoutPending
                ? "Opening checkout…"
                : proPlan.configured
                  ? session?.user
                    ? "Upgrade now"
                    : "Start with Pro"
                  : "Contact us"
            }
            actionDisabled={checkoutPending}
            variant="featured"
            onAction={handleProAction}
          />
          <PricingCard
            title="Enterprise"
            price="Custom"
            description="A tailored operating plan for organizations with demanding security, reliability, and support needs."
            featureIntro="All Pro features, plus:"
            features={ENTERPRISE_FEATURES}
            action="Talk to sales"
            onAction={() => router.push("/contact/sales")}
          />
        </div>
      </div>
    </section>
  );
}
