import { ArrowLeftRight, Ellipsis, TrendingUp } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Image } from "swift-rust/image";
import { meadow, unsplashLoader } from "@/lib/photos";
import { cn } from "@/lib/utils";
import { type Country, Flag } from "./flag";
import { SectionHeading } from "./section-heading";

export function Platform() {
  return (
    <section
      id="platform"
      aria-labelledby="platform-title"
      className="scroll-mt-24 bg-wash py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="platform-title"
          eyebrow="The platform"
          lead="Bring every market"
          rest="into one dashboard"
        >
          Balances, revenue and payouts across every country you sell in —
          reconciled to the cent and readable at a glance.
        </SectionHeading>

        <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
          <Row
            index="01"
            lead="One balance,"
            rest="every currency"
            body="Hold, convert and pay out from a single multi-currency ledger. Rates lock the moment you convert, and every movement is reconciled automatically."
            points={[
              "35 settlement currencies",
              "Real-time FX with locked quotes",
            ]}
            visual={<BalanceVisual />}
          />
          <Row
            reverse
            index="02"
            lead="Revenue"
            rest="you can actually read"
            body="Gross volume, MRR, churn and approval rates, broken down by market and payment method. Export anything, or query it with SQL."
            points={[
              "Live, not next-day",
              "Cohorts, retention and anomaly alerts",
            ]}
            visual={<DashboardVisual />}
          />
          <Row
            index="03"
            lead="Payouts"
            rest="on autopilot"
            body="Pay sellers, creators and contractors in 40+ countries over the fastest local rail — one at a time or in bulk, straight from the API."
            points={[
              "Bank accounts and mobile wallets",
              "Bulk payouts via API or CSV",
            ]}
            visual={<PayoutsVisual />}
          />
        </div>

        <dl className="reveal mt-24 grid grid-cols-2 gap-y-10 border-y border-line py-12 sm:mt-28 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col-reverse items-center px-2 text-center lg:border-l lg:border-line lg:first:border-l-0"
            >
              <dt className="mt-2 text-[14px] text-mute">{s.label}</dt>
              <dd className="font-display text-[clamp(2.8rem,5.4vw,4.25rem)] leading-none tracking-[-0.02em] text-ink">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// Placeholder targets — replace with measured numbers before launch.
const STATS = [
  { value: "135+", label: "Currencies accepted" },
  { value: "40+", label: "Payout countries" },
  { value: "99.99%", label: "API uptime" },
  { value: "<150ms", label: "Median API response" },
];

function Row({
  index,
  lead,
  rest,
  body,
  points,
  visual,
  reverse,
}: {
  index: string;
  lead: string;
  rest: string;
  body: string;
  points: string[];
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn("reveal", reverse && "lg:order-2")}>
        <span className="font-mono text-[12px] text-brand-600">{index}</span>
        <h3 className="mt-3 text-[clamp(1.9rem,3.6vw,2.75rem)] leading-[1.02] font-light tracking-[-0.04em] text-ink">
          <span className="font-display text-[1.1em] tracking-[-0.015em]">
            {lead}
          </span>{" "}
          {rest}
        </h3>
        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-mute">
          {body}
        </p>
        <ul className="mt-6 space-y-2.5">
          {points.map((p) => (
            <li
              key={p}
              className="flex items-center gap-2.5 text-[14.5px] text-ink-soft"
            >
              <span className="size-1.5 rounded-full bg-brand-500" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="reveal">{visual}</div>
    </div>
  );
}

/* ── 01 · balances over the meadow ───────────────────────────────────────── */

const ACCOUNTS: { country: Country; code: string; amount: string }[] = [
  { country: "us", code: "USD", amount: "$412,340.18" },
  { country: "gb", code: "GBP", amount: "£23,433.99" },
  { country: "eu", code: "EUR", amount: "€9,120.40" },
  { country: "jp", code: "JPY", amount: "¥739,795" },
];

function BalanceVisual() {
  return (
    <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] bg-[#a8c8ec]">
      <Image
        src={meadow.src}
        alt=""
        width={meadow.width}
        height={meadow.height}
        placeholder="blur"
        blurDataURL={meadow.blurDataURL}
        loader={unsplashLoader}
        sizes="(min-width: 1152px) 544px, (min-width: 1024px) 46vw, 100vw"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white/85 py-1.5 pr-3 pl-1.5 text-[11.5px] font-medium text-ink shadow-lg backdrop-blur sm:top-6 sm:left-6">
        <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-white">
          <ArrowLeftRight className="size-3" />
        </span>
        GBP → JPY · rate locked
      </div>
      <div className="absolute right-4 bottom-4 left-4 rounded-[22px] bg-white/95 p-2 shadow-[0_30px_60px_-24px_rgb(16_24_64/0.55)] backdrop-blur sm:right-6 sm:bottom-6 sm:left-auto sm:w-[300px]">
        <div className="flex items-baseline justify-between px-3 pt-2 pb-3">
          <span className="text-[12px] font-medium text-mute">
            All accounts
          </span>
          <span className="text-[20px] font-medium tracking-[-0.03em] text-ink tabular-nums">
            $465,778.00
          </span>
        </div>
        <ul className="rounded-2xl bg-wash p-1">
          {ACCOUNTS.map((a) => (
            <li
              key={a.code}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] odd:bg-white"
            >
              <Flag country={a.country} className="size-5" />
              <span className="font-medium text-ink">{a.code}</span>
              <span className="ml-auto font-mono text-[12px] text-ink-soft tabular-nums">
                {a.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── 02 · dashboard ──────────────────────────────────────────────────────── */

const VOLUME = [
  { label: "Online payments", value: "$26,800", pct: 64, color: "#1f9d55" },
  { label: "Subscriptions", value: "$10,400", pct: 42, color: "#6936f5" },
  { label: "In-store sales", value: "$4,340", pct: 20, color: "#e0529c" },
];

// Transactions per day, in dot rows (peak on Wednesday).
const DOTS = [2, 3, 2, 4, 3, 5, 7, 5, 4, 3, 4, 2, 3, 2];
const PEAK = 6;

function DashboardVisual() {
  return (
    <div className="relative rounded-[28px] bg-white p-3 ring-1 ring-line sm:p-4">
      <div className="rounded-[22px] bg-wash p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-medium text-ink">Gross volume</span>
          <span className="grid size-8 place-items-center rounded-full bg-white text-mute ring-1 ring-line">
            <Ellipsis className="size-4" />
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <span className="text-[clamp(2.5rem,6vw,3.4rem)] leading-none font-normal tracking-[-0.045em] text-ink tabular-nums">
            $41,540
          </span>
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-ink shadow-[0_6px_16px_-6px_rgb(31_157_85/0.5)]">
            <TrendingUp className="size-3.5 text-emerald-600" /> 15%
          </span>
        </div>
        <div className="my-6 h-px bg-line" />
        <ul className="space-y-5">
          {VOLUME.map((v) => (
            <li key={v.label}>
              <div className="flex items-center justify-between text-[13.5px]">
                <span className="text-mute">{v.label}</span>
                <span className="font-medium text-ink tabular-nums">
                  {v.value}
                </span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-white ring-1 ring-line">
                <div
                  className="hatch h-full rounded-full"
                  style={
                    { width: `${v.pct}%`, "--bar": v.color } as CSSProperties
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex items-center gap-5 rounded-[22px] bg-wash px-5 py-4 sm:mt-4">
        <div>
          <p className="text-[13px] text-mute">Transactions</p>
          <p className="mt-1 text-[28px] leading-none tracking-[-0.04em] text-ink tabular-nums">
            106k
          </p>
        </div>
        <div className="ml-auto flex items-end gap-1" aria-hidden="true">
          {DOTS.map((n, col) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: static decorative chart
              key={col}
              className="flex flex-col-reverse gap-1"
            >
              {Array.from({ length: n }, (_, row) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: static decorative chart
                  key={row}
                  className={cn(
                    "size-1.5 rounded-full sm:size-2",
                    col === PEAK ? "bg-brand-600" : "bg-brand-200",
                  )}
                />
              ))}
            </span>
          ))}
        </div>
        <p className="hidden text-right text-[12px] text-mute sm:block">
          vs last period
          <span className="block text-[14px] font-medium text-ink tabular-nums">
            +34,002
          </span>
        </p>
      </div>
    </div>
  );
}

/* ── 03 · payouts ────────────────────────────────────────────────────────── */

type Status = "Paid" | "In transit" | "Scheduled";

const PAYOUTS: {
  country: Country;
  city: string;
  rail: string;
  amount: string;
  status: Status;
}[] = [
  {
    country: "ng",
    city: "Lagos, Nigeria",
    rail: "NIP · instant",
    amount: "₦1,240,000",
    status: "Paid",
  },
  {
    country: "de",
    city: "Berlin, Germany",
    rail: "SEPA Instant",
    amount: "€8,420.00",
    status: "Paid",
  },
  {
    country: "br",
    city: "São Paulo, Brazil",
    rail: "Pix",
    amount: "R$12,300.00",
    status: "In transit",
  },
  {
    country: "ke",
    city: "Nairobi, Kenya",
    rail: "Mobile money",
    amount: "KSh 96,500",
    status: "Scheduled",
  },
];

const STATUS_STYLE: Record<Status, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  "In transit": "bg-brand-50 text-brand-700",
  Scheduled: "bg-wash text-mute",
};

function PayoutsVisual() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#ddd2ff_0%,#f3efff_100%)] p-4 sm:p-8">
      <div className="relative rounded-[22px] bg-white p-2 shadow-[0_30px_60px_-30px_rgb(42_18_112/0.45)]">
        <div className="flex items-center justify-between px-3 pt-2 pb-3">
          <span className="text-[15px] font-medium text-ink">Payouts</span>
          <span className="font-mono text-[11px] text-mute">
            Today · 4 of 128
          </span>
        </div>
        <ul className="space-y-1">
          {PAYOUTS.map((p) => (
            <li
              key={p.city}
              className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-wash"
            >
              <Flag country={p.country} className="size-8" />
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium text-ink">
                  {p.city}
                </p>
                <p className="font-mono text-[11px] text-mute">{p.rail}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[13.5px] font-medium text-ink tabular-nums">
                  {p.amount}
                </p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                    STATUS_STYLE[p.status],
                  )}
                >
                  {p.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
