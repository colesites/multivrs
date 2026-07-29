import type { Metadata } from "next";
import { Suspense } from "react";
import { CapabilitiesSection } from "@/components/marketing/CapabilitiesSection";
import { DeferredUniverseCanvas } from "@/components/marketing/DeferredUniverseCanvas";
import { FaqStream } from "@/components/marketing/FaqStream";
import { HeroSection } from "@/components/marketing/HeroSection";

export const metadata: Metadata = {
  title: "Multivrs | Software Ecosystem for Modern Teams",
  description:
    "Multivrs builds a connected software ecosystem: cloud deployment, developer tooling, AI workflows, and premium product experiences.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <DeferredUniverseCanvas />

      {/* The DOM overlays */}
      <div id="dark-marketing-header" className="relative z-10 dark text-foreground">
        <HeroSection />
        <CapabilitiesSection />
      </div>
      <div className="relative z-10 text-foreground">
        <Suspense fallback={null}>
          <FaqStream page="home" />
        </Suspense>
      </div>
    </>
  );
}
