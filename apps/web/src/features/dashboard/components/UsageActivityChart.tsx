"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const EMPTY_SERIES = [
  { day: "Jul 1", usage: 0 },
  { day: "Jul 6", usage: 0 },
  { day: "Jul 11", usage: 0 },
  { day: "Jul 16", usage: 0 },
  { day: "Jul 21", usage: 0 },
  { day: "Jul 26", usage: 0 },
  { day: "Jul 31", usage: 0 },
];

export function UsageActivityChart() {
  return (
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
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.055)" />
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
  );
}
