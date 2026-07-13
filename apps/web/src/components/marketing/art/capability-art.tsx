import { cn } from "@/lib/utils";

/**
 * Minimal line diagrams for the capabilities band. Primary outlines carry a
 * `data-draw` attribute so the section can stroke them on with DrawSVG.
 */

type ArtProps = { className?: string };

const base = "h-full w-full text-white";
const stroke = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none" as const,
};

/** Deploy — launch through the edge layers to a global node. */
export function DeployArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={cn(base, className)}
    >
      {/* edge layers */}
      <g {...stroke} strokeOpacity="0.25">
        <line data-draw x1="34" y1="86" x2="86" y2="86" />
        <line data-draw x1="40" y1="72" x2="80" y2="72" />
        <line data-draw x1="46" y1="58" x2="74" y2="58" />
      </g>
      {/* launch arrow */}
      <g {...stroke} strokeOpacity="0.9">
        <line data-draw x1="60" y1="98" x2="60" y2="30" />
        <polyline data-draw points="48,42 60,28 72,42" />
      </g>
      <circle cx="60" cy="24" r="3.5" fill="currentColor" />
    </svg>
  );
}

/** Scale — concentric growth, replicating outward. */
export function ScaleArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={cn(base, className)}
    >
      <g {...stroke}>
        <rect
          data-draw
          x="46"
          y="46"
          width="28"
          height="28"
          rx="4"
          strokeOpacity="0.9"
        />
        <rect
          data-draw
          x="34"
          y="34"
          width="52"
          height="52"
          rx="6"
          strokeOpacity="0.4"
        />
        <rect
          data-draw
          x="22"
          y="22"
          width="76"
          height="76"
          rx="8"
          strokeOpacity="0.18"
        />
      </g>
      <g fill="currentColor">
        <circle cx="22" cy="22" r="3" fillOpacity="0.7" />
        <circle cx="98" cy="22" r="3" fillOpacity="0.7" />
        <circle cx="22" cy="98" r="3" fillOpacity="0.7" />
        <circle cx="98" cy="98" r="3" fillOpacity="0.7" />
      </g>
    </svg>
  );
}

/** Secure — a shield wrapping a lock. */
export function SecureArt({ className }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={cn(base, className)}
    >
      <path
        data-draw
        d="M60 20 L92 32 V60 C92 80 78 92 60 100 C42 92 28 80 28 60 V32 Z"
        {...stroke}
        strokeOpacity="0.85"
      />
      <path
        data-draw
        d="M60 30 L83 38 V60 C83 75 73 84 60 90 C47 84 37 75 37 60 V38 Z"
        {...stroke}
        strokeOpacity="0.18"
      />
      {/* lock */}
      <rect
        data-draw
        x="50"
        y="58"
        width="20"
        height="16"
        rx="3"
        {...stroke}
        strokeOpacity="0.7"
      />
      <path
        data-draw
        d="M54 58 V52 a6 6 0 0 1 12 0 V58"
        {...stroke}
        strokeOpacity="0.7"
      />
      <circle cx="60" cy="65" r="2" fill="currentColor" />
    </svg>
  );
}
