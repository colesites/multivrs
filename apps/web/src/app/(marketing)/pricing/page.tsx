import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { FaqStream } from "@/components/marketing/FaqStream";
import { PricingComparisonTable } from "@/components/marketing/PricingComparisonTable";
import { PricingPlansSkeleton } from "@/components/marketing/PricingPlansSkeleton";
import { PricingSection } from "@/components/marketing/PricingSection";
import { getPricingPlans } from "@/lib/payments/pricing";
import { getCachedPricingComparison } from "@/sanity/lib/pricing-comparison.service";

export const metadata: Metadata = {
  title: "Pricing | Multivrs",
  description:
    "Predictable, usage-based pricing for modern software teams. Start for free on our Hobby plan, or scale with Pro and Enterprise.",
  alternates: { canonical: "/pricing" },
};

/**
 * Each section loads its own data behind a Suspense boundary. Cache Components
 * requires that: awaiting the data in the page body would block the whole
 * route from prerendering.
 */
export default function PricingPage() {
  return (
    <>
      <Suspense fallback={<PricingPlansSkeleton />}>
        <PricingPlans />
      </Suspense>
      <Suspense fallback={null}>
        <PricingComparison />
      </Suspense>
      <Suspense fallback={null}>
        <FaqStream page="pricing" />
      </Suspense>
    </>
  );
}

async function PricingPlans() {
  await connection();
  const plans = await getPricingPlans();
  return <PricingSection {...plans} />;
}

async function PricingComparison() {
  const comparison = await getCachedPricingComparison();
  return <PricingComparisonTable comparison={comparison} />;
}
