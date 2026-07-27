"use client";

import { Clock3, Database, Network } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

export function UsageView({ usage }: { usage: AccountUsage }) {
  const summary = [
    {
      icon: Network,
      label: "Edge requests",
      value: usage.requests.toLocaleString(),
    },
    {
      icon: Database,
      label: "Data transfer",
      value: formatBytes(usage.bandwidthBytes),
    },
    {
      icon: Clock3,
      label: "Average latency",
      value: `${usage.averageLatency} ms`,
    },
  ];
  return (
    <div className="animate-in space-y-5 fade-in slide-in-from-bottom-2 duration-300">
      {usage.state !== "ready" && (
        <p className="border-y border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 text-xs text-amber-200">
          Cloudflare usage is{" "}
          {usage.state === "error"
            ? "temporarily unavailable"
            : "not configured"}
          .
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        {summary.map(({ label, value, icon: Icon }) => (
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
            <p className="mt-1 text-xs text-muted-foreground">Last 14 days</p>
          </div>
        ))}
      </div>
      <section className="border border-[var(--hairline)] bg-[var(--ink-raised)]/45">
        <div className="border-b border-[var(--hairline)] px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Request activity
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Live edge requests across every project.
          </p>
        </div>
        {usage.series.length ? (
          <div className="h-72 px-3 pb-4 pt-5 sm:px-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={usage.series}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="usage-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  fontSize={11}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
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
        ) : (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">
            Usage appears after the first served request.
          </p>
        )}
      </section>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}
