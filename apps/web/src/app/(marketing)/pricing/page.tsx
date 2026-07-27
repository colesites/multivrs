import type { Metadata } from "next";
import { FaqSection } from "@/components/marketing/FaqSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { getPricingPlans } from "@/lib/payments/pricing";
import { getFaqs } from "@/sanity/lib/faq-service";

export const metadata: Metadata = {
  title: "Pricing | Multivrs",
  description:
    "Predictable, usage-based pricing for modern software teams. Start for free on our Hobby plan, or scale with Pro and Enterprise.",
  alternates: { canonical: "/pricing" },
};

export const revalidate = 60;

export default async function PricingPage() {
  const [plans, faqs] = await Promise.all([
    getPricingPlans(),
    getFaqs("pricing"),
  ]);

  return (
    <>
      <PricingSection {...plans} />
      <FaqSection faqs={faqs} />
    </>
  );
}
