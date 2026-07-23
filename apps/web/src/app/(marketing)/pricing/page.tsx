import type { Metadata } from "next";
import { PricingSection } from "@/components/marketing/PricingSection";

export const metadata: Metadata = {
  title: "Pricing | Multivrs",
  description:
    "Predictable, usage-based pricing for modern software teams. Start for free on our Hobby plan, or scale with Pro and Enterprise.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingSection />;
}
