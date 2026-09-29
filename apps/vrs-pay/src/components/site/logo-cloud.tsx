import type { ReactNode } from "react";

// Placeholder wordmarks for fictional companies — replace with real customer
// logos (with their permission) before launch.
const MARKS: { name: string; mark: ReactNode }[] = [
  {
    name: "Northwind",
    mark: (
      <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          <path d="M10 2 18 17H2z" fill="currentColor" />
        </svg>
        Northwind
      </span>
    ),
  },
  {
    name: "Lumen",
    mark: <span className="font-display text-[26px] leading-none">Lumen</span>,
  },
  {
    name: "Kestrel",
    mark: (
      <span className="font-mono text-[15px] font-medium tracking-[0.28em]">
        KESTREL
      </span>
    ),
  },
  {
    name: "halcyon",
    mark: (
      <span className="flex items-center gap-1.5 text-[20px] font-medium tracking-[-0.04em]">
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          <circle
            cx="10"
            cy="10"
            r="7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
        halcyon
      </span>
    ),
  },
  {
    name: "Parallax",
    mark: (
      <span className="flex items-center gap-2 text-[19px] font-bold tracking-[-0.05em]">
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          <path d="M5 3h4l-3 14H2zM13 3h4l-3 14h-4z" fill="currentColor" />
        </svg>
        Parallax
      </span>
    ),
  },
  {
    name: "Meridian",
    mark: (
      <span className="flex items-center gap-2 text-[18px] font-light tracking-[0.02em]">
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          <path
            d="M2 16a8 8 0 0 1 16 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle cx="10" cy="16" r="2" fill="currentColor" />
        </svg>
        Meridian
      </span>
    ),
  },
  {
    name: "quanta",
    mark: (
      <span className="flex items-center gap-2 text-[20px] font-semibold tracking-[-0.04em]">
        <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
          {[4, 10, 16].flatMap((x) =>
            [4, 10, 16].map((y) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r="1.9"
                fill="currentColor"
              />
            )),
          )}
        </svg>
        quanta
      </span>
    ),
  },
];

export function LogoCloud() {
  return (
    <section aria-labelledby="logos-title" className="py-12 sm:py-16">
      <p id="logos-title" className="eyebrow text-center text-mute">
        Trusted by teams that scale globally
      </p>
      <div className="fade-x mt-8 overflow-hidden">
        <ul className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
          {[0, 1].map((copy) =>
            MARKS.map((m) => (
              <li
                key={`${copy}-${m.name}`}
                aria-hidden={copy === 1 ? true : undefined}
                className="px-8 text-ink/40 transition-colors hover:text-ink sm:px-12"
              >
                {m.mark}
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
