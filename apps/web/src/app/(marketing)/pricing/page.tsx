import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqStream } from "@/components/marketing/FaqStream";
import { PricingSection } from "@/components/marketing/PricingSection";
import { getPricingPlans } from "@/lib/payments/pricing";

export const metadata: Metadata = {
  title: "Pricing | Multivrs",
  description:
    "Predictable, usage-based pricing for modern software teams. Start for free on our Hobby plan, or scale with Pro and Enterprise.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const plans = await getPricingPlans();

  return (
    <>
      <PricingSection {...plans} />
      <Suspense fallback={null}>
        <FaqStream page="pricing" />
      </Suspense>
    </>
  );
}
