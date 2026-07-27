"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { AnalyticsPoint } from "@/features/dashboard/types/analytics.types";

export function AnalyticsChart({ points }: { points: AnalyticsPoint[] }) {
  return (
    <section className="border-y border-[var(--hairline)] py-7">
      <div className="mb-8">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Traffic timeline
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Hourly requests from the serving edge.
        </p>
      </div>
      {points.length ? (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 8, right: 0, left: -24, bottom: 0 }}
            >
              <defs>
                <linearGradient id="edgeTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.06)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                dy={12}
              />
              <Tooltip
                content={<TrafficTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.15)" }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#60a5fa"
                strokeWidth={2}
                fill="url(#edgeTraffic)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-52 items-center justify-center border border-dashed border-[var(--hairline)] text-sm text-muted-foreground">
          Traffic will appear after the first edge request.
        </div>
      )}
    </section>
  );
}

function TrafficTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-black/85 px-3 py-2 shadow-2xl backdrop-blur-xl">
      <p className="font-geist-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">
        {payload[0]?.value?.toLocaleString()} requests
      </p>
    </div>
  );
}
