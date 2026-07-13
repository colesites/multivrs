"use client";

import Galaxy from "@/components/Galaxy";

/**
 * Ambient galaxy starfield behind the Projects overview. Tuned low and
 * monochrome so it reads as depth, not decoration; a vignette + ink wash keep
 * cards legible. Non-interactive (pointer-events-none) so it never blocks UI.
 */
export function ProjectsBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <Galaxy
        density={0.65}
        starSpeed={0.18}
        speed={0.5}
        glowIntensity={0.14}
        saturation={0.0}
        twinkleIntensity={0.4}
        rotationSpeed={0.03}
        hueShift={210}
        mouseInteraction={false}
        mouseRepulsion={false}
        transparent
      />
      {/* Ink wash + top fade so the topbar edge and cards stay readable. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(10,10,11,0.35) 0%, rgba(10,10,11,0.72) 55%, rgba(10,10,11,0.92) 100%)",
        }}
      />
    </div>
  );
}
