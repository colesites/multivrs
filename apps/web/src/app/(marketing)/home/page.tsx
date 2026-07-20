import type { Metadata } from "next";
import { BrandWordmark } from "@/components/marketing/BrandWordmark";
import { CapabilitiesSection } from "@/components/marketing/CapabilitiesSection";
import { CtaSection } from "@/components/marketing/CtaSection";
import { HeroSection } from "@/components/marketing/HeroSection";
import { LatestSection } from "@/components/marketing/LatestSection";
import { ProductsBento } from "@/components/marketing/ProductsBento";
import { UniverseCanvas } from "@/components/marketing/UniverseCanvas";

export const metadata: Metadata = {
  title: "Multivrs | Software Ecosystem for Modern Teams",
  description:
    "Multivrs builds a connected software ecosystem: cloud deployment, developer tooling, AI workflows, and premium product experiences.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <UniverseCanvas />
      
      {/* The DOM overlays */}
      <div className="relative z-10">
        <HeroSection />
        <CapabilitiesSection />
        <ProductsBento />
        <LatestSection />
        <CtaSection />
        <BrandWordmark />
      </div>
    </>
  );
}
