import type { Metadata } from "next";
import { Suspense } from "react";
import { Services } from "@/components/marketing/Services";
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
      <div
        id="dark-marketing-header"
        className="relative z-10 dark text-foreground bg-background"
      >
        {/* Overscroll buffer for mobile rubber-banding at the top */}
        <div className="absolute inset-x-0 bottom-full h-[50vh] bg-[#0a0015]" />
        <HeroSection />
        <Services />
      </div>
      <div className="relative z-10 text-foreground">
        <Suspense fallback={null}>
          <FaqStream page="home" />
        </Suspense>
      </div>
    </>
  );
}
