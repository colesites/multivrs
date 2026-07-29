"use client";

import {
  Activity,
  ArrowDownToLine,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  ImageIcon,
  Network,
  RefreshCw,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface UsageMetric {
  description: string;
  icon: LucideIcon;
  included: string;
  label: string;
  scale?: string;
  used: string;
}

interface UsageGroup {
  id: string;
  label: string;
  metrics: UsageMetric[];
}

const USAGE_GROUPS: UsageGroup[] = [
  {
    id: "compute",
    label: "Compute",
    metrics: [
      {
        description: "Active execution time across Fluid compute",
        icon: Cpu,
        included: "4h",
        label: "Fluid Active CPU",
        scale: "16h",
        used: "0s",
      },
      {
        description: "Invocations across serverless functions",
        icon: Zap,
        included: "1M",
        label: "Function Invocations",
        used: "0",
      },
    ],
  },
  {
    id: "networking",
    label: "Networking",
    metrics: [
      {
        description: "Data transferred from your origin",
        icon: ArrowDownToLine,
        included: "10 GB",
        label: "Fast Origin Transfer",
        scale: "100 GB",
        used: "0 B",
      },
      {
        description: "Requests served from the Multivrs edge",
        icon: Network,
        included: "1M",
        label: "Edge Requests",
        scale: "10M",
        used: "0",
      },
      {
        description: "Cached and dynamic data delivered globally",
        icon: Gauge,
        included: "100 GB",
        label: "Fast Data Transfer",
        scale: "1 TB",
        used: "0 B",
      },
    ],
  },
  {
    id: "images-caching",
    label: "Images & caching",
    metrics: [
      {
        description: "New optimized images written to cache",
        icon: HardDrive,
        included: "100K",
        label: "Image Optimization — Cache Writes",
        scale: "200K",
        used: "0",
      },
      {
        description: "Optimized images served from cache",
        icon: ImageIcon,
        included: "300K",
        label: "Image Optimization — Cache Reads",
        scale: "600K",
        used: "0",
      },
      {
        description: "Unique image transformations processed",
        icon: RefreshCw,
        included: "5K",
        label: "Image Optimization — Transformations",
        scale: "10K",
        used: "0",
      },
      {
        description: "Incremental pages written to cache",
        icon: Database,
        included: "200K",
        label: "ISR Writes",
        scale: "2M",
        used: "0",
      },
      {
        description: "Incremental pages served from cache",
        icon: Activity,
        included: "1M",
        label: "ISR Reads",
        used: "0",
      },
    ],
  },
];

const EMPTY_SERIES = [
  { day: "Jul 1", usage: 0 },
  { day: "Jul 6", usage: 0 },
  { day: "Jul 11", usage: 0 },
  { day: "Jul 16", usage: 0 },
  { day: "Jul 21", usage: 0 },
  { day: "Jul 26", usage: 0 },
  { day: "Jul 31", usage: 0 },
];

export function UsageView() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b border-[var(--hairline)] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.18em] text-blue-400">
            Multivrs usage
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Your resources, at a glance
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Track compute, network, image, and cache consumption across every
            project.
          </p>
        </div>
        <div className="flex items-center gap-3 font-geist-mono text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
          Jul 1 – Jul 31
        </div>
      </header>

      <section
        aria-labelledby="usage-activity-title"
        className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--ink-raised)]/65 transition-colors hover:border-[var(--hairline-strong)] hover:bg-[var(--ink-raised)]/80"
      >
        <div className="flex flex-col gap-4 border-b border-[var(--hairline)] px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3
              id="usage-activity-title"
              className="text-sm font-semibold text-foreground"
            >
              Usage activity
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Percentage of included monthly resources consumed
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums tracking-tight">
              0%
            </span>
            <span className="text-xs text-muted-foreground">of plan used</span>
          </div>
        </div>

        <div className="relative h-64 overflow-hidden bg-[linear-gradient(180deg,rgba(59,130,246,0.035),transparent)] px-2 py-5">
          <div className="pointer-events-none absolute left-5 top-5 z-10 font-geist-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60">
            All resources
          </div>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={EMPTY_SERIES}
              margin={{ top: 36, right: 16, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="usage-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.055)"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                fontSize={10}
              />
              <YAxis
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value: number) => `${value}%`}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
                fontSize={10}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.12)" }}
                contentStyle={{
                  background: "#0f0f10",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(value) => [`${value}%`, "Plan used"]}
              />
              <Area
                type="monotone"
                dataKey="usage"
                stroke="#60a5fa"
                strokeWidth={2}
                fill="url(#usage-area)"
                activeDot={{ fill: "#60a5fa", r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="space-y-9">
        {USAGE_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`usage-${group.id}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3
                id={`usage-${group.id}`}
                className="font-geist-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                {group.label}
              </h3>
              <span className="font-geist-mono text-[10px] text-muted-foreground/60">
                Included monthly
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {group.metrics.map((metric) => (
                <UsageCard key={metric.label} metric={metric} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="border-t border-[var(--hairline)] pt-5 text-xs leading-5 text-muted-foreground">
        Usage tracking is in preview. Values will begin updating when Multivrs
        metering is connected.
      </p>
    </div>
  );
}

function UsageCard({ metric }: { metric: UsageMetric }) {
  const Icon = metric.icon;

  return (
    <article className="group flex min-h-48 flex-col rounded-xl border border-[var(--hairline)] bg-[var(--ink-raised)]/65 p-4 transition-colors hover:border-[var(--hairline-strong)] hover:bg-[var(--ink-raised)]/85">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-black text-blue-400 ring-1 ring-white/5 transition-colors group-hover:bg-blue-400/[0.06] group-hover:ring-blue-400/20">
          <Icon className="size-[18px]" strokeWidth={1.7} />
        </span>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
            {metric.label}
          </h4>
          <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {metric.description}
          </p>
        </div>

        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] bg-black/20 font-geist-mono text-[9px] text-blue-300">
          0%
        </span>
      </div>

      <div className="mt-auto pt-6">
        <p className="font-geist-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/50">
          Used this period
        </p>
        <div className="mt-1.5 flex items-baseline gap-2 font-geist-mono">
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {metric.used}
          </span>
          <span className="text-xs text-muted-foreground">
            of {metric.included}
          </span>
        </div>

        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="absolute inset-y-0 left-0 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
        </div>

        <div className="mt-3 flex items-center justify-between font-geist-mono text-[10px] text-muted-foreground/55">
          <span>Included monthly</span>
          {metric.scale ? <span>Scale up to {metric.scale}</span> : null}
        </div>
      </div>
    </article>
  );
}
