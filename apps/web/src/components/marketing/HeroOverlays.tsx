/**
 * Visual overlay effects for the hero section.
 * Noise texture, radial glow, subtle grid — all via CSS pseudo-elements.
 */
export function HeroOverlays() {
  return (
    <>
      {/* Noise texture overlay */}
      <div
        className="noise-overlay pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
      />

      {/* Primary radial glow — cosmic deep blue center */}
      <div
        className="pointer-events-none absolute inset-0 z-2"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(30,58,138,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Secondary blue glow — bottom right accent */}
      <div
        className="pointer-events-none absolute inset-0 z-2"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 40% 35% at 70% 75%, rgba(29,78,216,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Vignette — darkened edges */}
      <div
        className="pointer-events-none absolute inset-0 z-3"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(3,3,3,0.6) 100%)",
        }}
      />
    </>
  );
}
