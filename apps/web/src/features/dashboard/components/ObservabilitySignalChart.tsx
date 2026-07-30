"use client";

import dynamic from "next/dynamic";
import type { AnalyticsPoint } from "@/features/dashboard/types/analytics.types";

const Line = dynamic(() => import("recharts").then((module) => module.Line), {
  ssr: false,
});
const LineChart = dynamic(
  () => import("recharts").then((module) => module.LineChart),
  { ssr: false },
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((module) => module.ResponsiveContainer),
  { ssr: false },
);
const Tooltip = dynamic(
  () => import("recharts").then((module) => module.Tooltip),
  { ssr: false },
);
const XAxis = dynamic(() => import("recharts").then((module) => module.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((module) => module.YAxis), {
  ssr: false,
});

type SignalKey = "bandwidthBytes" | "errors" | "latency" | "requests";

export function ObservabilitySignalChart({
  data,
  signal,
}: {
  data: AnalyticsPoint[];
  signal: SignalKey;
}) {
  return (
    <div className="mt-4 h-32">
      {data.length ? (
        <ResponsiveContainer height="100%" width="100%">
          <LineChart
            data={data}
            margin={{ bottom: 0, left: -30, right: 0, top: 8 }}
          >
            <XAxis
              axisLine={false}
              dataKey="label"
              fontSize={9}
              interval="preserveStartEnd"
              tickLine={false}
            />
            <YAxis axisLine={false} fontSize={9} tickLine={false} width={36} />
            <Tooltip
              contentStyle={{
                background: "rgb(10 10 10)",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Line
              dataKey={signal}
              dot={false}
              isAnimationActive={false}
              stroke="rgb(96 165 250)"
              strokeWidth={1.5}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-end border-b border-[var(--hairline)] pb-2 font-geist-mono text-[9px] text-muted-foreground">
          Waiting for edge telemetry
        </div>
      )}
    </div>
  );
}
