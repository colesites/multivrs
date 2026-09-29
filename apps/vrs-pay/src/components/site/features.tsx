import { Lock, ShieldCheck, Zap } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { type Country, Flag } from "./flag";
import { LogoMark } from "./logo";
import { SectionHeading } from "./section-heading";

export function Features() {
  return (
    <section
      id="product"
      aria-labelledby="product-title"
      className="mx-auto max-w-6xl scroll-mt-8 px-4 py-20 sm:px-6 sm:py-28"
    >
      <SectionHeading
        id="product-title"
        eyebrow="One API"
        lead="Build once,"
        rest="get paid anywhere"
      >
        Cards, wallets, bank debits and local rails behind a single typed API.
        Price in your customer's currency, settle in yours.
      </SectionHeading>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 md:grid-cols-3 md:gap-5">
        <FeatureCard
          title="Global acceptance"
          body="Local payment methods in 40+ markets, routed automatically for the highest approval rate in each one."
          visual={<GlobeVisual />}
        />
        <FeatureCard
          title="135+ currencies"
          body="Quote locally and settle where you bank. FX is locked at checkout, so the price you show is the price you get."
          visual={<CurrencyOrbit />}
        />
        <FeatureCard
          title="Security by default"
          body="Tokenized card vault, 3-D Secure and adaptive fraud rules. Raw card data never touches your servers."
          visual={<SecurityVisual />}
        />
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  visual,
}: {
  title: string;
  body: string;
  visual: ReactNode;
}) {
  return (
    <article className="reveal flex flex-col rounded-[28px] border border-line bg-white p-2 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgb(11_11_18/0.25)]">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[22px]">
        {visual}
      </div>
      <div className="px-4 pt-5 pb-4">
        <h3 className="text-[19px] font-medium tracking-[-0.02em] text-ink">
          {title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-mute">{body}</p>
      </div>
    </article>
  );
}

/* ── Visual 1: payment routes over a rising globe ─────────────────────────── */

// Pin coordinates share the SVG's 400×320 viewBox so overlays line up.
const PINS: { country: Country; x: number; y: number }[] = [
  { country: "us", x: 92, y: 178 },
  { country: "de", x: 214, y: 112 },
  { country: "ng", x: 306, y: 168 },
];

function GlobeVisual() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#9fc6f0_0%,#d6e8fa_55%,#f2f7fd_100%)]">
      <svg
        viewBox="0 0 400 320"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="globe-fill" cx="50%" cy="20%" r="80%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <g fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="1">
          <circle cx="200" cy="330" r="220" fill="url(#globe-fill)" />
          {[0.28, 0.6, 0.9].map((k) => (
            <ellipse key={k} cx="200" cy="330" rx={220 * k} ry="220" />
          ))}
          {/* parallels: chords of the r=220 circle at these heights */}
          {(
            [
              [262, 209],
              [196, 174],
              [146, 120],
            ] as const
          ).map(([y, half]) => (
            <path key={y} d={`M${200 - half} ${y}h${half * 2}`} />
          ))}
        </g>
        <g fill="none" stroke="#6936f5" strokeWidth="1.6" strokeLinecap="round">
          <path
            d="M92 178Q140 70 214 112"
            className="route"
            strokeDasharray="4 6"
          />
          <path
            d="M214 112Q280 80 306 168"
            className="route"
            strokeDasharray="4 6"
          />
        </g>
      </svg>

      {PINS.map((p) => (
        <span
          key={p.country}
          className="absolute grid size-8 -translate-1/2 place-items-center rounded-full bg-white shadow-[0_8px_20px_-6px_rgb(16_24_64/0.45)]"
          style={{
            left: `${(p.x / 400) * 100}%`,
            top: `${(p.y / 320) * 100}%`,
          }}
        >
          <Flag country={p.country} className="size-5" />
        </span>
      ))}

      <div className="absolute top-4 left-4 flex items-center gap-2.5 rounded-2xl bg-white/90 py-2 pr-3.5 pl-2 shadow-[0_10px_30px_-12px_rgb(16_24_64/0.4)] backdrop-blur">
        <span className="grid size-7 place-items-center rounded-xl bg-brand-600 text-white">
          <Zap className="size-3.5" />
        </span>
        <span className="text-[12px] leading-tight font-medium text-ink">
          Instant global payments
          <span className="block font-mono text-[10px] font-normal text-mute">
            US → DE · settled in 1.2s
          </span>
        </span>
      </div>
    </div>
  );
}

/* ── Visual 2: currencies orbiting the VRS mark ──────────────────────────── */

const OUTER = ["$", "€", "£", "¥", "₦", "₹"];
const INNER: Country[] = ["br", "ke", "jp", "in"];

function onRing(
  i: number,
  count: number,
  radius: number,
  offset = -90,
): CSSProperties {
  const a = ((360 / count) * i + offset) * (Math.PI / 180);
  return {
    left: `${50 + Math.cos(a) * radius}%`,
    top: `${50 + Math.sin(a) * radius}%`,
  };
}

function CurrencyOrbit() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,#ddd2ff_0%,#ede8ff_55%,#f7f5ff_100%)]">
      <div
        className="relative aspect-square w-[min(62%,236px)]"
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-full border border-dashed border-brand-300/80" />
        <div className="absolute inset-[22%] rounded-full border border-dashed border-brand-300/80" />

        <div className="absolute inset-0 animate-orbit">
          {OUTER.map((symbol, i) => (
            <span
              key={symbol}
              className="absolute grid size-10 -translate-1/2 animate-orbit-reverse place-items-center rounded-full bg-white text-[15px] font-medium text-ink shadow-[0_8px_20px_-8px_rgb(42_18_112/0.45)]"
              style={onRing(i, OUTER.length, 50)}
            >
              {symbol}
            </span>
          ))}
        </div>
        <div className="absolute inset-[22%] animate-orbit-reverse">
          {INNER.map((country, i) => (
            <span
              key={country}
              className="absolute grid size-8 -translate-1/2 animate-orbit place-items-center rounded-full bg-white shadow-[0_8px_20px_-8px_rgb(42_18_112/0.45)]"
              style={onRing(i, INNER.length, 50, -45)}
            >
              <Flag country={country} className="size-5" />
            </span>
          ))}
        </div>

        <div className="absolute top-1/2 left-1/2 grid size-16 -translate-1/2 place-items-center rounded-[20px] bg-white shadow-[0_16px_40px_-12px_rgb(42_18_112/0.5)]">
          <LogoMark className="size-9 text-brand-600" />
        </div>
      </div>
    </div>
  );
}

/* ── Visual 3: a card number goes in, a vault token comes out ─────────────── */

function SecurityVisual() {
  return (
    <div className="grain absolute inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,#2a1d5c_0%,#0b0b12_62%)]">
      <div className="relative -mt-12">
        <div className="relative aspect-[1.586] w-[212px] -rotate-6 rounded-2xl bg-[linear-gradient(135deg,#8f6bff_0%,#6936f5_45%,#3b19a6_100%)] p-4 text-white shadow-[0_28px_60px_-20px_rgb(105_54_245/0.75)] ring-1 ring-white/20">
          <div className="flex items-center justify-between">
            <span className="h-5 w-7 rounded-[5px] bg-[linear-gradient(135deg,#f6e7b0,#c7a54c)]" />
            <LogoMark className="size-5 text-white [--logo-stroke:#6936f5]" />
          </div>
          <p className="absolute bottom-9 left-4 font-mono text-[12.5px] tracking-[0.14em]">
            •••• •••• •••• 4242
          </p>
          <p className="absolute bottom-4 left-4 font-mono text-[9px] tracking-wider text-white/70">
            EXP 09/29
          </p>
        </div>
        <div className="absolute -right-10 -bottom-5 flex rotate-3 items-center gap-1.5 rounded-full bg-white py-1.5 pr-3 pl-2 font-mono text-[11px] text-ink shadow-[0_12px_30px_-10px_rgb(0_0_0/0.6)]">
          <Lock className="size-3 text-brand-600" />
          tok_8fQ2kLx3
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-2xl bg-white/10 py-2 pr-3.5 pl-2 text-white ring-1 ring-white/15 backdrop-blur">
        <span className="grid size-7 place-items-center rounded-xl bg-emerald-400/90 text-ink">
          <ShieldCheck className="size-3.5" />
        </span>
        <span className="text-[12px] leading-tight font-medium">
          Protect your funds
          <span className="block font-mono text-[10px] font-normal text-white/60">
            Tokenized vault · 3-D Secure
          </span>
        </span>
      </div>
    </div>
  );
}
