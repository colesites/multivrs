import { formatMoney } from "./format";

const WIDTH = 640;
const HEIGHT = 180;
const PAD = 6;

/** A lightweight SVG area chart of daily revenue (no chart library). */
export function RevenueChart({
  daily,
  currency,
}: {
  daily: Array<{ date: string; amount: number }>;
  currency: string;
}) {
  const max = Math.max(1, ...daily.map((d) => d.amount));
  const step = (WIDTH - PAD * 2) / Math.max(1, daily.length - 1);
  const points = daily.map((d, i) => {
    const x = PAD + i * step;
    const y = HEIGHT - PAD - (d.amount / max) * (HEIGHT - PAD * 2);
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${(WIDTH - PAD).toFixed(1)},${HEIGHT - PAD} L${PAD},${HEIGHT - PAD} Z`;
  const total = daily.reduce((sum, d) => sum + d.amount, 0);
  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-44 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Revenue over the last ${daily.length} days: ${formatMoney(total, currency)}`}
      >
        <defs>
          <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-brand-500)"
              stopOpacity="0.25"
            />
            <stop
              offset="100%"
              stopColor="var(--color-brand-500)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        <line
          x1={PAD}
          x2={WIDTH - PAD}
          y1={HEIGHT - PAD}
          y2={HEIGHT - PAD}
          stroke="var(--color-line)"
        />
        <path d={area} fill="url(#revenue-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <figcaption className="mt-2 flex justify-between font-mono text-[11px] text-mute">
        <span>{daily[0]?.date}</span>
        <span>{daily.at(-1)?.date}</span>
      </figcaption>
    </figure>
  );
}
