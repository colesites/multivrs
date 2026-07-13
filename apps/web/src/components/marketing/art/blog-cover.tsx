import { cn } from "@/lib/utils";

/**
 * Generated monochrome cover art for blog cards — a tiled hairline pattern plus
 * one geometric accent per variant. Patterns tile so they stay crisp at any
 * card size, and there are no external images to load. Swap for a Sanity image
 * field when the CMS is wired up.
 */

type BlogCoverProps = { variant: number; className?: string };

export function BlogCover({ variant, className }: BlogCoverProps) {
  const v = ((variant % 4) + 4) % 4;
  const patternId = `blog-pattern-${v}`;

  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 320 200"
      className={cn("h-full w-full text-white", className)}
    >
      <defs>
        {v === 0 && (
          <pattern
            id={patternId}
            width="18"
            height="18"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 18 L18 0"
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          </pattern>
        )}
        {v === 1 && (
          <pattern
            id={patternId}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="3"
              cy="3"
              r="1.1"
              fill="currentColor"
              fillOpacity="0.16"
            />
          </pattern>
        )}
        {v === 2 && (
          <pattern
            id={patternId}
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M13 8 V18 M8 13 H18"
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
          </pattern>
        )}
        {v === 3 && (
          <pattern
            id={patternId}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="4"
              y="4"
              width="16"
              height="16"
              rx="3"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.1"
            />
          </pattern>
        )}
      </defs>

      <rect width="320" height="200" fill={`url(#${patternId})`} />

      {/* per-variant geometric accent */}
      <g
        stroke="currentColor"
        fill="none"
        strokeWidth="1.25"
        strokeOpacity="0.5"
        strokeLinecap="round"
      >
        {v === 0 && <polyline points="232,72 268,100 232,128" />}
        {v === 1 && <circle cx="252" cy="100" r="30" />}
        {v === 2 && <rect x="222" y="70" width="60" height="60" rx="10" />}
        {v === 3 && (
          <>
            <line x1="222" y1="100" x2="282" y2="100" />
            <circle
              cx="252"
              cy="100"
              r="6"
              fill="currentColor"
              fillOpacity="0.6"
              stroke="none"
            />
          </>
        )}
      </g>
    </svg>
  );
}
