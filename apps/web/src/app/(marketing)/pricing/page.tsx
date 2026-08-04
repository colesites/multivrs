import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqStream } from "@/components/marketing/FaqStream";
import { PricingComparisonTable } from "@/components/marketing/PricingComparisonTable";
import { PricingSection } from "@/components/marketing/PricingSection";
import { getPricingPlans } from "@/lib/payments/pricing";
import { getPricingComparison } from "@/sanity/lib/pricing-comparison.service";

export const metadata: Metadata = {
  title: "Pricing | Multivrs",
  description:
    "Predictable, usage-based pricing for modern software teams. Start for free on our Hobby plan, or scale with Pro and Enterprise.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const [plans, comparison] = await Promise.all([
    getPricingPlans(),
    getPricingComparison(),
  ]);

  return (
    <>
      <PricingSection {...plans} />
      <PricingComparisonTable comparison={comparison} />
      <Suspense fallback={null}>
        <FaqStream page="pricing" />
      </Suspense>
    </>
  );
}
