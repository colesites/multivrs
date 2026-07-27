import { Activity, Clock3, TriangleAlert } from "lucide-react";
import type { PlatformAnalytics } from "@/features/dashboard/types/analytics.types";

export function AnalyticsMetrics({ data }: { data: PlatformAnalytics }) {
  const metrics = [
    {
      icon: Activity,
      label: "Edge requests",
      value: data.requests.toLocaleString(),
      detail: "Last 24 hours",
    },
    {
      icon: Clock3,
      label: "Average latency",
      value: `${data.averageLatency} ms`,
      detail: "End-to-end response time",
    },
    {
      icon: TriangleAlert,
      label: "Server error rate",
      value: `${data.errorRate.toFixed(2)}%`,
      detail: "HTTP 5xx responses",
    },
  ];
  return (
    <div className="grid divide-y divide-[var(--hairline)] border-y border-[var(--hairline)] md:grid-cols-3 md:divide-x md:divide-y-0">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="group px-5 py-6 transition-colors hover:bg-white/[0.02]"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </p>
            <metric.icon className="size-4 text-blue-400" />
          </div>
          <p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-foreground">
            {metric.value}
          </p>
          <p className="mt-2 font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {metric.detail}
          </p>
        </article>
      ))}
    </div>
  );
}
