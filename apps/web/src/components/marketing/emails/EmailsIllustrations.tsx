/**
 * Inline SVG illustrations for the /emails marketing page.
 * Strokes use `currentColor` so they follow the light/dark theme, with the
 * brand purple (#A855F7) as the single accent.
 */

const ACCENT = "#A855F7";

type IllustrationProps = { className?: string };

/** Inbound routing: many senders converge on one domain, then fan out to mailboxes. */
export function InboundRoutingIllustration({ className }: IllustrationProps) {
  const sources = [24, 64, 104, 144];
  const targets = [44, 84, 124];
  return (
    <svg
      viewBox="0 0 320 168"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeOpacity="0.22" strokeWidth="1">
        {sources.map((y) => (
          <path key={`s-${y}`} d={`M44 ${y} C 100 ${y}, 110 84, 146 84`} />
        ))}
        {targets.map((y) => (
          <path key={`t-${y}`} d={`M174 84 C 210 84, 220 ${y}, 262 ${y}`} />
        ))}
      </g>
      <g stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 10">
        <path d="M44 64 C 100 64, 110 84, 146 84">
          <animate
            attributeName="stroke-dashoffset"
            from="28"
            to="0"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M174 84 C 210 84, 220 44, 262 44">
          <animate
            attributeName="stroke-dashoffset"
            from="28"
            to="0"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </path>
      </g>
      {sources.map((y) => (
        <g key={`src-${y}`}>
          <rect
            x="16"
            y={y - 9}
            width="28"
            height="18"
            rx="3"
            stroke="currentColor"
            strokeOpacity="0.35"
          />
          <path
            d={`M16 ${y - 7}l14 9 14-9`}
            stroke="currentColor"
            strokeOpacity="0.35"
          />
        </g>
      ))}
      <rect
        x="138"
        y="64"
        width="44"
        height="40"
        rx="10"
        fill={ACCENT}
        fillOpacity="0.12"
        stroke={ACCENT}
      />
      <text
        x="160"
        y="88"
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        fill={ACCENT}
      >
        MX
      </text>
      {targets.map((y, i) => (
        <g key={`dst-${y}`}>
          <rect
            x="262"
            y={y - 11}
            width="44"
            height="22"
            rx="5"
            stroke={i === 0 ? ACCENT : "currentColor"}
            strokeOpacity={i === 0 ? 1 : 0.35}
          />
          <rect
            x="268"
            y={y - 3}
            width={i === 0 ? 26 : 20}
            height="2.5"
            rx="1.25"
            fill="currentColor"
            fillOpacity="0.35"
          />
          <rect
            x="268"
            y={y + 2}
            width="14"
            height="2.5"
            rx="1.25"
            fill="currentColor"
            fillOpacity="0.2"
          />
        </g>
      ))}
    </svg>
  );
}

/** A signed webhook pulse travelling from the platform to your server. */
export function WebhookPulseIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="12"
        y="36"
        width="64"
        height="48"
        rx="10"
        stroke="currentColor"
        strokeOpacity="0.35"
      />
      <path
        d="M30 56l14 10 14-10"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.25"
      />
      <rect
        x="244"
        y="30"
        width="64"
        height="60"
        rx="8"
        stroke="currentColor"
        strokeOpacity="0.35"
      />
      <g fill="currentColor" fillOpacity="0.3">
        <rect x="254" y="42" width="44" height="5" rx="2.5" />
        <rect x="254" y="57" width="44" height="5" rx="2.5" />
        <rect x="254" y="72" width="44" height="5" rx="2.5" />
      </g>
      <circle cx="258" cy="44.5" r="1.5" fill={ACCENT} />
      <path
        d="M76 60 H 108 L 120 38 L 136 84 L 150 48 L 160 68 L 168 60 H 244"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M76 60 H 108 L 120 38 L 136 84 L 150 48 L 160 68 L 168 60 H 244"
        stroke={ACCENT}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeDasharray="60 240"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="300"
          to="0"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </path>
      <g
        fontFamily="ui-monospace, monospace"
        fontSize="7"
        fill="currentColor"
        fillOpacity="0.5"
      >
        <text x="188" y="50">
          HMAC
        </text>
        <text x="188" y="80">
          SHA-256
        </text>
      </g>
    </svg>
  );
}

/** A calendar grid with a clock, for scheduled sends and automations. */
export function ScheduleIllustration({ className }: IllustrationProps) {
  const cells = Array.from({ length: 21 }, (_, i) => i);
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="20"
        y="20"
        width="130"
        height="100"
        rx="8"
        stroke="currentColor"
        strokeOpacity="0.35"
      />
      <path d="M20 40h130" stroke="currentColor" strokeOpacity="0.2" />
      {cells.map((i) => {
        const col = i % 7;
        const row = Math.floor(i / 7);
        const active = i === 10;
        return (
          <rect
            key={i}
            x={28 + col * 17}
            y={50 + row * 22}
            width="11"
            height="11"
            rx="2.5"
            fill={active ? ACCENT : "currentColor"}
            fillOpacity={active ? 1 : 0.12}
          />
        );
      })}
      <circle
        cx="150"
        cy="100"
        r="26"
        fill="var(--background, #000)"
        stroke={ACCENT}
        strokeWidth="1.5"
      />
      <path
        d="M150 86v14l9 6"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
