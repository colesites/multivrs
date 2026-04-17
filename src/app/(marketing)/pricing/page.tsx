import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Compare Multivrs pricing plans for startups, growing teams, and enterprise organizations.",
};

export default function PricingPage() {
  return <PageShell title="Pricing" description="Compare Free, Pro, Business, and Enterprise plans designed for modern software teams." />;
}
