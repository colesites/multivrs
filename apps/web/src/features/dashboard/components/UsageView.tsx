"use client";

import { Activity, Database, Gauge, Network } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const USAGE_TREND = [
  { day: "Jul 1", requests: 42 },
  { day: "Jul 2", requests: 58 },
  { day: "Jul 3", requests: 49 },
  { day: "Jul 4", requests: 71 },
  { day: "Jul 5", requests: 64 },
  { day: "Jul 6", requests: 86 },
  { day: "Jul 7", requests: 80 },
  { day: "Jul 8", requests: 93 },
  { day: "Jul 9", requests: 75 },
  { day: "Jul 10", requests: 104 },
  { day: "Jul 11", requests: 90 },
  { day: "Jul 12", requests: 116 },
  { day: "Jul 13", requests: 109 },
  { day: "Today", requests: 128 },
];

const RESOURCES = [
  {
    label: "Fluid Active CPU",
    used: "3h 10m",
    limit: "4h",
    width: "w-[79%]",
  },
  {
    label: "Fast Origin Transfer",
    used: "4.67 GB",
    limit: "10 GB",
    width: "w-[47%]",
  },
  { label: "Edge Requests", used: "254K", limit: "1M", width: "w-1/4" },
  {
    label: "Image Optimization - Cache Writes",
    used: "14K",
    limit: "100K",
    width: "w-[14%]",
  },
  {
    label: "Function Invocations",
    used: "118K",
    limit: "1M",
    width: "w-[12%]",
  },
  {
    label: "Fast Data Transfer",
    used: "11.71 GB",
    limit: "100 GB",
    width: "w-[12%]",
  },
  {
    label: "Image Optimization - Cache Reads",
    used: "32K",
    limit: "300K",
    width: "w-[11%]",
  },
  {
    label: "Image Optimization - Transformations",
    used: "486",
    limit: "5K",
    width: "w-[10%]",
  },
  { label: "ISR Writes", used: "7.3K", limit: "200K", width: "w-[4%]" },
  { label: "ISR Reads", used: "34K", limit: "1M", width: "w-[4%]" },
];

const SUMMARY = [
  { label: "Fluid Active CPU", value: "3h 9m", limit: "of 4h", icon: Gauge },
  { label: "Edge Requests", value: "254K", limit: "of 1M", icon: Network },
  {
    label: "Fast Data Transfer",
    value: "11.71 GB",
    limit: "of 100 GB",
    icon: Database,
  },
];

export function UsageView() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-300">
      <div className="grid gap-3 md:grid-cols-3">
        {SUMMARY.map(({ label, value, limit, icon: Icon }) => (
          <div
            key={label}
            className="border border-[var(--hairline)] bg-[var(--ink-raised)]/55 p-4"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">{label}</span>
              <Icon className="size-4 text-blue-400" />
            </div>
            <p className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {limit} this month
            </p>
          </div>
        ))}
      </div>

      <section className="border border-[var(--hairline)] bg-[var(--ink-raised)]/45">
        <div className="flex items-start justify-between border-b border-[var(--hairline)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Request activity
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Requests across every project in the last 14 days
            </p>
          </div>
          <span className="rounded-md border border-[var(--hairline)] px-2 py-1 text-xs text-muted-foreground">
            Last 14 days
          </span>
        </div>
        <div className="h-72 px-3 pb-4 pt-5 sm:px-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={USAGE_TREND}
              margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
            >
              <defs>
                <linearGradient id="usage-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#60a5fa"
                strokeWidth={2}
                fill="url(#usage-area)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="border border-[var(--hairline)] bg-[var(--ink-raised)]/45">
        <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-5 py-4">
          <Activity className="size-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-foreground">
            Resource usage
          </h2>
        </div>
        <div className="divide-y divide-[var(--hairline)]">
          {RESOURCES.map((resource) => (
            <div
              key={resource.label}
              className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(10rem,1fr)_2fr_auto] sm:items-center"
            >
              <span className="text-sm font-medium text-foreground">
                {resource.label}
              </span>
              <div className="h-1.5 overflow-hidden bg-white/8">
                <div className={`h-full bg-blue-400 ${resource.width}`} />
              </div>
              <span className="text-right font-geist-mono text-xs text-muted-foreground">
                {resource.used}{" "}
                <span className="text-foreground/45">/ {resource.limit}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
