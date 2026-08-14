/**
 * Visual overlay effects for the hero section.
 * Noise texture, subtle radial depth, and edge vignette.
 */
export function HeroOverlays() {
  return (
    <>
      {/* Noise texture overlay */}
      <div
        className="noise-overlay pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
      />

      {/* Subtle purple ambient glow behind text */}
      <div
        className="pointer-events-none absolute inset-0 z-2"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(168,85,247,0.1) 0%, transparent 70%)",
        }}
      />

      {/* Vignette — darkened edges */}
      <div
        className="pointer-events-none absolute inset-0 z-3"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 45%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </>
  );
}
