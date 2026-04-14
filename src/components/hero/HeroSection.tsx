"use client";

import dynamic from "next/dynamic";
import { HeroContent } from "@/components/hero/HeroContent";
import { HeroOverlays } from "@/components/hero/HeroOverlays";
import { Navbar } from "@/components/Navbar";

const HeroBackground = dynamic(
  () =>
    import("@/components/hero/HeroBackgroundCanvas").then((mod) => ({
      default: mod.HeroBackgroundCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 z-0 bg-linear-to-b from-[#0a0015] via-background to-background"
        aria-hidden="true"
      />
    ),
  }
);

const HeroForeground = dynamic(
  () =>
    import("@/components/hero/HeroForegroundCanvas").then((mod) => ({
      default: mod.HeroForegroundCanvas,
    })),
  { ssr: false }
);

/**
 * Main hero section wrapper.
 * Composes dual 3D canvas (background and foreground sandwiching) + overlays + text.
 */
export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-svh w-full overflow-hidden"
    >
      <Navbar />

      {/* Z-0: 3D background (stars, asteroids, web) */}
      <HeroBackground />

      {/* Z-10: Visual effects: noise, grid, glow, vignette */}
      <HeroOverlays />

      {/* Z-20: Foreground text content */}
      <HeroContent />

      {/* Z-30: Foreground 3D (massive overlapping planets) */}
      <HeroForeground />

      {/* Z-40: Bottom gradient fade to next section */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 z-40 h-32 bg-linear-to-t from-background to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
