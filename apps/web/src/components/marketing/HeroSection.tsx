"use client";

import dynamic from "next/dynamic";
import { HeroContent } from "@/components/marketing/HeroContent";
import { HeroOverlays } from "@/components/marketing/HeroOverlays";

const MoltenMetal = dynamic(() => import("@/components/MoltenMetal"), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0 z-0 bg-black"
      aria-hidden="true"
    />
  ),
});

/**
 * Main hero section wrapper.
 * Features React Bits Molten Metal WebGL dynamic background + Fold Text headline.
 */
export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-svh w-full overflow-hidden bg-black"
    >
      {/* Z-0: React Bits Molten Metal WebGL background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <MoltenMetal
          color1="#3b0764"
          color2="#A855F7"
          color3="#ffffff"
          speed={0.3}
          scale={3.8}
          detail={3}
          glow={1.7}
          coreSize={0.12}
          swirl={1.1}
          fold={-0.2}
          blackPoint={0.06}
          brightness={1.35}
          grain={true}
          grainIntensity={0.04}
          mouseInteraction={true}
          mouseStrength={0.3}
          opacity={1.0}
        />
      </div>

      {/* Z-10: Visual effects: noise & ambient vignette */}
      <HeroOverlays />

      {/* Z-20: Foreground FoldText headline & hero content */}
      <HeroContent />
    </section>
  );
}
