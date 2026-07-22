import type { Metadata } from "next";
import { CapabilitiesSection } from "@/components/marketing/CapabilitiesSection";
import { HeroSection } from "@/components/marketing/HeroSection";
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
      </div>
    </>
  );
}
