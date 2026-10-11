"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  CreditCard,
  CheckCircle2,
  Percent,
  Coins,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApi } from "../context";
import { formatMoney } from "../format";
import { Loading, ErrorNote } from "../ui";

export interface MetricWithTrend {
  value: number;
  previous: number;
  trend_pct: number;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  timestamp: number;
  accepted_volume: number;
  accepted_payments: number;
  success_rate: number;
  net_volume: number;
}

export interface MethodBreakdown {
  category: string;
  label: string;
  volume: number;
  count: number;
  share: number;
}

export interface StatusBreakdown {
  status: string;
  label: string;
  volume: number;
  count: number;
}

export interface PaymentsAnalyticsData {
  object: "payments.analytics";
  range_days: number;
  currency: string;
  metrics: {
    success_rate: MetricWithTrend;
    accepted_volume: MetricWithTrend;
    accepted_payments: MetricWithTrend;
    net_volume: MetricWithTrend;
    refunded_volume: MetricWithTrend;
  };
  time_series: TimeSeriesPoint[];
  breakdown: {
    methods: MethodBreakdown[];
    statuses: StatusBreakdown[];
  };
}

type ActiveMetricKey =
  | "success_rate"
  | "accepted_volume"
  | "accepted_payments"
  | "net_volume";

type SubSection = "acceptance" | "methods" | "disputes";

export function PaymentsAnalyticsView() {
  const [rangeDays, setRangeDays] = useState<number>(30);
  const [activeMetric, setActiveMetric] = useState<ActiveMetricKey>("accepted_volume");
  const [activeSubSection, setActiveSubSection] = useState<SubSection>("acceptance");
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);
  const [breakdownPivot, setBreakdownPivot] = useState<"volume" | "count" | "share">("volume");

  const { data, error, reload } = useApi<PaymentsAnalyticsData>(
    `/v1/payments/analytics?range=${rangeDays}`,
  );

  if (error) {
    return <ErrorNote message={error} onRetry={reload} />;
  }

  if (!data) {
    return <Loading label="Calculating payments analytics..." />;
  }

  const { metrics, time_series, currency, breakdown } = data;

  // Chart calculation
  const getMetricValue = (p: TimeSeriesPoint) => {
    switch (activeMetric) {
      case "success_rate":
        return p.success_rate;
      case "accepted_volume":
        return p.accepted_volume;
      case "accepted_payments":
        return p.accepted_payments;
      case "net_volume":
        return p.net_volume;
    }
  };

  const values = time_series.map(getMetricValue);
  const maxValue = Math.max(...values, activeMetric === "success_rate" ? 100 : 1);
  const minValue = 0;

  // SVG Chart points
  const chartWidth = 800;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const points = time_series.map((point, index) => {
    const val = getMetricValue(point);
    const x =
      paddingX +
      (time_series.length > 1
        ? (index / (time_series.length - 1)) * innerWidth
        : innerWidth / 2);
    const normalizedY = maxValue > minValue ? (val - minValue) / (maxValue - minValue) : 0;
    const y = chartHeight - paddingY - normalizedY * innerHeight;
    return { x, y, point, val };
  });

  const linePath = points.length
    ? `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`
    : "";

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L ${lastPoint.x.toFixed(1)},${chartHeight - paddingY} L ${firstPoint.x.toFixed(1)},${chartHeight - paddingY} Z`
      : "";

  // Metric format helper
  const formatMetricDisplay = (key: ActiveMetricKey, val: number) => {
    if (key === "success_rate") return `${val.toFixed(1)}%`;
    if (key === "accepted_payments") return val.toLocaleString();
    return formatMoney(val, currency);
  };

  return (
    <div className="grid gap-6">
      {/* Top Header & Range Selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink flex items-center gap-2">
            Payments analytics
          </h2>
          <p className="text-xs text-mute mt-0.5">
            Real-time authorization, success rates, volume and method breakdown.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-wash/60 p-1">
          <Calendar className="ml-2 mr-1 size-3.5 text-mute" />
          <button
            type="button"
            onClick={() => setRangeDays(7)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              rangeDays === 7 ? "bg-white text-ink shadow-2xs font-semibold" : "text-mute hover:text-ink"
            }`}
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => setRangeDays(30)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              rangeDays === 30 ? "bg-white text-ink shadow-2xs font-semibold" : "text-mute hover:text-ink"
            }`}
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => setRangeDays(90)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              rangeDays === 90 ? "bg-white text-ink shadow-2xs font-semibold" : "text-mute hover:text-ink"
            }`}
          >
            Last 3 months
          </button>
        </div>
      </div>

      {/* Sub-tabs: Acceptance, Payment methods, Disputes */}
      <div className="flex items-center gap-2 border-b border-line pb-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveSubSection("acceptance")}
          className={`pb-2 px-1 transition-colors border-b-2 cursor-pointer ${
            activeSubSection === "acceptance"
              ? "border-[#635BFF] text-[#635BFF] font-semibold"
              : "border-transparent text-mute hover:text-ink"
          }`}
        >
          Acceptance
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection("methods")}
          className={`pb-2 px-1 transition-colors border-b-2 cursor-pointer ${
            activeSubSection === "methods"
              ? "border-[#635BFF] text-[#635BFF] font-semibold"
              : "border-transparent text-mute hover:text-ink"
          }`}
        >
          Payment methods
        </button>
        <button
          type="button"
          onClick={() => setActiveSubSection("disputes")}
          className={`pb-2 px-1 transition-colors border-b-2 cursor-pointer ${
            activeSubSection === "disputes"
              ? "border-[#635BFF] text-[#635BFF] font-semibold"
              : "border-transparent text-mute hover:text-ink"
          }`}
        >
          Refunds & Net
        </button>
      </div>

      {/* Key Metrics Cards Strip */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-ink uppercase tracking-wider">
            Key metrics
          </span>
          <span className="text-[11px] text-mute">
            Compared to previous {rangeDays} days
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Success Rate */}
          <button
            type="button"
            onClick={() => setActiveMetric("success_rate")}
            className={`flex flex-col rounded-xl border p-4 text-left transition-all cursor-pointer ${
              activeMetric === "success_rate"
                ? "border-[#635BFF] ring-2 ring-[#635BFF]/15 bg-white shadow-xs"
                : "border-line bg-white/70 hover:border-line-strong hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-mute mb-1">
              <span>Payment success rate</span>
              <Percent className="size-3.5 text-mute" />
            </div>
            <div className="text-xl font-semibold text-ink">
              {metrics.success_rate.value.toFixed(1)}%
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              {metrics.success_rate.trend_pct >= 0 ? (
                <span className="inline-flex items-center font-medium text-emerald-600">
                  <TrendingUp className="size-3 mr-0.5" />
                  +{metrics.success_rate.trend_pct}%
                </span>
              ) : (
                <span className="inline-flex items-center font-medium text-amber-600">
                  <TrendingDown className="size-3 mr-0.5" />
                  {metrics.success_rate.trend_pct}%
                </span>
              )}
              <span className="text-mute">vs prev</span>
            </div>
          </button>

          {/* Accepted Volume */}
          <button
            type="button"
            onClick={() => setActiveMetric("accepted_volume")}
            className={`flex flex-col rounded-xl border p-4 text-left transition-all cursor-pointer ${
              activeMetric === "accepted_volume"
                ? "border-[#635BFF] ring-2 ring-[#635BFF]/15 bg-white shadow-xs"
                : "border-line bg-white/70 hover:border-line-strong hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-mute mb-1">
              <span>Accepted volume</span>
              <Coins className="size-3.5 text-mute" />
            </div>
            <div className="text-xl font-semibold text-ink">
              {formatMoney(metrics.accepted_volume.value, currency)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              {metrics.accepted_volume.trend_pct >= 0 ? (
                <span className="inline-flex items-center font-medium text-emerald-600">
                  <TrendingUp className="size-3 mr-0.5" />
                  +{metrics.accepted_volume.trend_pct}%
                </span>
              ) : (
                <span className="inline-flex items-center font-medium text-amber-600">
                  <TrendingDown className="size-3 mr-0.5" />
                  {metrics.accepted_volume.trend_pct}%
                </span>
              )}
              <span className="text-mute">vs prev</span>
            </div>
          </button>

          {/* Accepted Payments */}
          <button
            type="button"
            onClick={() => setActiveMetric("accepted_payments")}
            className={`flex flex-col rounded-xl border p-4 text-left transition-all cursor-pointer ${
              activeMetric === "accepted_payments"
                ? "border-[#635BFF] ring-2 ring-[#635BFF]/15 bg-white shadow-xs"
                : "border-line bg-white/70 hover:border-line-strong hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-mute mb-1">
              <span>Accepted payments</span>
              <CheckCircle2 className="size-3.5 text-mute" />
            </div>
            <div className="text-xl font-semibold text-ink">
              {metrics.accepted_payments.value.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              {metrics.accepted_payments.trend_pct >= 0 ? (
                <span className="inline-flex items-center font-medium text-emerald-600">
                  <TrendingUp className="size-3 mr-0.5" />
                  +{metrics.accepted_payments.trend_pct}%
                </span>
              ) : (
                <span className="inline-flex items-center font-medium text-amber-600">
                  <TrendingDown className="size-3 mr-0.5" />
                  {metrics.accepted_payments.trend_pct}%
                </span>
              )}
              <span className="text-mute">vs prev</span>
            </div>
          </button>

          {/* Net Volume */}
          <button
            type="button"
            onClick={() => setActiveMetric("net_volume")}
            className={`flex flex-col rounded-xl border p-4 text-left transition-all cursor-pointer ${
              activeMetric === "net_volume"
                ? "border-[#635BFF] ring-2 ring-[#635BFF]/15 bg-white shadow-xs"
                : "border-line bg-white/70 hover:border-line-strong hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-mute mb-1">
              <span>Expected net payout</span>
              <ArrowUpRight className="size-3.5 text-mute" />
            </div>
            <div className="text-xl font-semibold text-ink">
              {formatMoney(metrics.net_volume.value, currency)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              <span className="text-mute">
                Refunds: {formatMoney(metrics.refunded_volume.value, currency)}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Interactive Time-Series Chart */}
      <Card className="p-5 border-line bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink capitalize">
              {activeMetric.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-mute">over time</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-mute">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#635BFF]" />
              Current period
            </span>
            {hoveredPoint && (
              <span className="text-xs font-medium text-ink bg-wash px-2 py-0.5 rounded-md">
                {hoveredPoint.label}: {formatMetricDisplay(activeMetric, getMetricValue(hoveredPoint))}
              </span>
            )}
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            role="img"
            aria-label={`${activeMetric.replace(/_/g, " ")} over time`}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-56 select-none"
          >
            <title>{`${activeMetric.replace(/_/g, " ")} over time`}</title>
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#635BFF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#635BFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - paddingY - ratio * innerHeight;
              const labelValue = minValue + ratio * (maxValue - minValue);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-gray-400 font-mono"
                  >
                    {activeMetric === "success_rate"
                      ? `${Math.round(labelValue)}%`
                      : activeMetric === "accepted_payments"
                        ? Math.round(labelValue)
                        : formatMoney(Math.round(labelValue), currency)}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#purpleGradient)" />}

            {/* Line Path */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#635BFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Dots */}
            {points.map((p) => (
              <g key={p.point.date}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint?.date === p.point.date ? 5 : 3}
                  className={`transition-all ${
                    hoveredPoint?.date === p.point.date
                      ? "fill-[#635BFF] stroke-white stroke-2"
                      : "fill-[#635BFF]"
                  }`}
                />
                {/* Invisible hover capture area */}
                {/* biome-ignore lint/a11y/noStaticElementInteractions: SVG chart hover capture hit target */}
                <rect
                  x={p.x - 12}
                  y={0}
                  width={24}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(p.point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* X-axis date labels */}
          <div className="flex justify-between px-10 text-[10px] text-mute font-mono mt-1">
            <span>{time_series[0]?.label}</span>
            <span>{time_series[Math.floor(time_series.length / 2)]?.label}</span>
            <span>{time_series[time_series.length - 1]?.label}</span>
          </div>
        </div>
      </Card>

      {/* Payments Breakdown Section */}
      <div className="grid gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-ink">Payments breakdown</h3>
            <p className="text-xs text-mute">
              Review payment method acceptance and volume distribution.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-line bg-wash/60 p-1">
            <button
              type="button"
              onClick={() => setBreakdownPivot("volume")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                breakdownPivot === "volume"
                  ? "bg-white text-ink shadow-2xs font-semibold"
                  : "text-mute hover:text-ink"
              }`}
            >
              Payment volume
            </button>
            <button
              type="button"
              onClick={() => setBreakdownPivot("count")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                breakdownPivot === "count"
                  ? "bg-white text-ink shadow-2xs font-semibold"
                  : "text-mute hover:text-ink"
              }`}
            >
              Payments
            </button>
            <button
              type="button"
              onClick={() => setBreakdownPivot("share")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                breakdownPivot === "share"
                  ? "bg-white text-ink shadow-2xs font-semibold"
                  : "text-mute hover:text-ink"
              }`}
            >
              Share of volume
            </button>
          </div>
        </div>

        {/* Breakdown Cards & Proportional Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {breakdown.methods.length === 0 ? (
            <Card className="p-6 text-center text-xs text-mute col-span-2">
              No payments captured in this period yet.
            </Card>
          ) : (
            breakdown.methods.map((method) => (
              <Card key={method.category} className="p-4 border-line bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#635BFF]">
                      <CreditCard className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-ink">{method.label}</div>
                      <div className="text-[11px] text-mute">{method.count} payment{method.count === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink">
                      {formatMoney(method.volume, currency)}
                    </div>
                    <div className="text-[11px] font-medium text-emerald-600">{method.share}% share</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-wash rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#635BFF] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(method.share, 4)}%` }}
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
