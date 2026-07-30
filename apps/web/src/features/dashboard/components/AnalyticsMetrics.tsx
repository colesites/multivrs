import { Activity, Clock3, Eye, Gauge, Users } from "lucide-react";
import type { PlatformAnalytics } from "@/features/dashboard/types/analytics.types";

export function AnalyticsMetrics({ data }: { data: PlatformAnalytics }) {
  const metrics = [
    {
      icon: Eye,
      label: "Pageviews",
      value: data.pageviews.toLocaleString(),
      detail: `Selected ${data.range} window`,
    },
    {
      icon: Users,
      label: "Unique visitors",
      value: data.visitors.toLocaleString(),
      detail: `${data.sessions.toLocaleString()} sessions`,
    },
    {
      icon: Activity,
      label: "Edge requests",
      value: data.requests.toLocaleString(),
      detail: `Selected ${data.range} window`,
    },
    {
      icon: Gauge,
      label: "Average latency",
      value: `${data.averageLatency} ms`,
      detail: "End-to-end response time",
    },
    {
      icon: Clock3,
      label: "Bounce rate",
      value: `${data.bounceRate.toFixed(1)}%`,
      detail: "Single-page sessions",
    },
  ];
  return (
    <div className="grid divide-y divide-[var(--hairline)] border-y border-[var(--hairline)] md:grid-cols-2 md:divide-x xl:grid-cols-5 xl:divide-y-0">
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
