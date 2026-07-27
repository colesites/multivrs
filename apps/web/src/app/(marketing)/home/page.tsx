import type { Metadata } from "next";
import { CapabilitiesSection } from "@/components/marketing/CapabilitiesSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { HeroSection } from "@/components/marketing/HeroSection";
import { UniverseCanvas } from "@/components/marketing/UniverseCanvas";
import { getFaqs } from "@/sanity/lib/faq-service";

export const metadata: Metadata = {
  title: "Multivrs | Software Ecosystem for Modern Teams",
  description:
    "Multivrs builds a connected software ecosystem: cloud deployment, developer tooling, AI workflows, and premium product experiences.",
  alternates: { canonical: "/" },
};

export const revalidate = 60;

export default async function Home() {
  const faqs = await getFaqs("home");

  return (
    <>
      <UniverseCanvas />

      {/* The DOM overlays */}
      <div className="relative z-10">
        <HeroSection />
        <CapabilitiesSection />
        <FaqSection faqs={faqs} />
      </div>
    </>
  );
}
