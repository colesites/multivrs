import { cn } from "@/lib/utils";

/**
 * Hand-authored, gradient-free line art for the product bento.
 *
 * One shared visual language across every piece: hairline strokes in
 * `currentColor` (white) at varied opacities, rounded caps, and a recurring
 * node/dot motif. Each piece scales to fill its card; the parent controls size.
 */

type ArtProps = { className?: string };

const svgBase = "h-full w-full text-white";

/** Swift Rust — velocity / compiler chevrons racing forward. */
export function SwiftRustArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={cn(svgBase, className)}
    >
      {/* baseline + measure ticks */}
      <g stroke="currentColor" strokeOpacity="0.12" strokeWidth="1">
        <line x1="22" y1="128" x2="218" y2="128" />
        {[22, 55, 88, 121, 154, 187, 218].map((x) => (
          <line key={x} x1={x} y1="124" x2={x} y2="132" />
        ))}
      </g>
      {/* motion streaks */}
      <g stroke="currentColor" strokeLinecap="round">
        <line
          x1="28"
          y1="62"
          x2="92"
          y2="62"
          strokeOpacity="0.28"
          strokeWidth="1.25"
        />
        <line
          x1="20"
          y1="78"
          x2="72"
          y2="78"
          strokeOpacity="0.16"
          strokeWidth="1"
        />
        <line
          x1="34"
          y1="94"
          x2="84"
          y2="94"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
      </g>
      {/* accelerating chevrons */}
      <g
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="108,52 138,80 108,108" strokeOpacity="0.3" />
        <polyline points="140,52 170,80 140,108" strokeOpacity="0.6" />
        <polyline points="172,52 202,80 172,108" strokeOpacity="0.95" />
      </g>
      <circle cx="210" cy="80" r="3" fill="currentColor" />
    </svg>
  );
}

/** Swift Rust UI — a composed interface wireframe. */
export function SwiftRustUiArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={cn(svgBase, className)}
    >
      <rect
        x="26"
        y="22"
        width="188"
        height="116"
        rx="11"
        stroke="currentColor"
        strokeOpacity="0.28"
      />
      {/* window bar */}
      <line
        x1="26"
        y1="46"
        x2="214"
        y2="46"
        stroke="currentColor"
        strokeOpacity="0.16"
      />
      <g fill="currentColor" fillOpacity="0.4">
        <circle cx="40" cy="34" r="2.5" />
        <circle cx="50" cy="34" r="2.5" />
        <circle cx="60" cy="34" r="2.5" />
      </g>
      {/* sidebar */}
      <rect
        x="38"
        y="60"
        width="44"
        height="62"
        rx="5"
        stroke="currentColor"
        strokeOpacity="0.18"
      />
      <g
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeLinecap="round"
        strokeWidth="2"
      >
        <line x1="48" y1="72" x2="72" y2="72" />
        <line x1="48" y1="84" x2="66" y2="84" />
        <line x1="48" y1="96" x2="70" y2="96" />
      </g>
      {/* content rows */}
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <line x1="98" y1="64" x2="198" y2="64" strokeOpacity="0.3" />
        <line x1="98" y1="78" x2="176" y2="78" strokeOpacity="0.18" />
        <line x1="98" y1="92" x2="188" y2="92" strokeOpacity="0.18" />
      </g>
      {/* button */}
      <rect
        x="98"
        y="108"
        width="56"
        height="18"
        rx="9"
        stroke="currentColor"
        strokeOpacity="0.85"
      />
    </svg>
  );
}

/** Domains — a wireframe globe wired into DNS nodes. */
export function DomainsArt({ className }: ArtProps) {
  const nodes = [
    { x: 168, y: 44 },
    { x: 186, y: 104 },
    { x: 150, y: 150 },
  ];
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={cn(svgBase, className)}
    >
      {/* connectors */}
      <g stroke="currentColor" strokeOpacity="0.14">
        {nodes.map((n) => (
          <line key={`${n.x}-${n.y}`} x1="84" y1="90" x2={n.x} y2={n.y} />
        ))}
      </g>
      {/* globe */}
      <g stroke="currentColor">
        <circle cx="84" cy="90" r="54" strokeOpacity="0.3" />
        <ellipse cx="84" cy="90" rx="22" ry="54" strokeOpacity="0.14" />
        <ellipse cx="84" cy="90" rx="44" ry="54" strokeOpacity="0.1" />
        <line x1="30" y1="90" x2="138" y2="90" strokeOpacity="0.14" />
        <path d="M36 64 Q84 80 132 64" strokeOpacity="0.12" />
        <path d="M36 116 Q84 100 132 116" strokeOpacity="0.12" />
      </g>
      {/* dns nodes */}
      <g>
        {nodes.map((n) => (
          <circle
            key={`n-${n.x}`}
            cx={n.x}
            cy={n.y}
            r="4"
            fill="currentColor"
            fillOpacity="0.65"
          />
        ))}
        <circle cx="84" cy="90" r="4.5" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Email — envelope geometry with a forwarding route threading through. */
export function EmailArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={cn(svgBase, className)}
    >
      {/* routing path */}
      <path
        d="M16 132 C70 132 70 80 120 80 C170 80 170 36 224 36"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.25"
        strokeDasharray="2 6"
        strokeLinecap="round"
      />
      {/* envelope */}
      <g stroke="currentColor">
        <rect
          x="58"
          y="48"
          width="124"
          height="84"
          rx="9"
          strokeOpacity="0.3"
        />
        <polyline
          points="62,56 120,98 178,56"
          strokeOpacity="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* endpoints */}
      <circle cx="16" cy="132" r="4" fill="currentColor" fillOpacity="0.65" />
      <circle cx="224" cy="36" r="4" fill="currentColor" />
      <circle cx="120" cy="80" r="3" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

/** Kontinue AI — the flagship: an intelligence core orbited by continuity nodes. */
export function KontinueArt({ className }: ArtProps) {
  const c = { x: 160, y: 180 };
  const orbit = [
    { x: 160, y: 70, r: 5 },
    { x: 252, y: 150, r: 4 },
    { x: 232, y: 268, r: 6 },
    { x: 84, y: 244, r: 4 },
    { x: 70, y: 128, r: 4 },
  ];
  return (
    <svg
      viewBox="0 0 320 360"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={cn(svgBase, className)}
    >
      {/* concentric orbits */}
      <g stroke="currentColor">
        <circle cx={c.x} cy={c.y} r="110" strokeOpacity="0.07" />
        <circle cx={c.x} cy={c.y} r="78" strokeOpacity="0.12" />
        <circle cx={c.x} cy={c.y} r="44" strokeOpacity="0.22" />
        {/* sweeping continuation arc */}
        <path
          d="M160 70 A110 110 0 0 1 270 180"
          strokeOpacity="0.4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 7"
        />
      </g>
      {/* node connectors */}
      <g stroke="currentColor" strokeOpacity="0.12">
        {orbit.map((n) => (
          <line key={`l-${n.x}-${n.y}`} x1={c.x} y1={c.y} x2={n.x} y2={n.y} />
        ))}
      </g>
      {/* core */}
      <circle
        cx={c.x}
        cy={c.y}
        r="15"
        stroke="currentColor"
        strokeOpacity="0.7"
      />
      <circle cx={c.x} cy={c.y} r="6" fill="currentColor" />
      {/* orbiting nodes */}
      <g>
        {orbit.map((n) => (
          <circle
            key={`o-${n.x}-${n.y}`}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill="currentColor"
            fillOpacity={n.r >= 6 ? 0.9 : 0.55}
          />
        ))}
      </g>
      {/* faint scatter */}
      <g fill="currentColor" fillOpacity="0.18">
        <circle cx="40" cy="60" r="1.5" />
        <circle cx="288" cy="96" r="1.5" />
        <circle cx="296" cy="300" r="1.5" />
        <circle cx="48" cy="312" r="1.5" />
      </g>
    </svg>
  );
}
