"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  MousePointerClick,
  Users,
} from "lucide-react";
import { mockAnalytics } from "@/lib/mock";
import { cn } from "@/lib/utils";

export function AnalyticsMetrics() {
  const metrics = [
    {
      title: "Unique Visitors",
      value: mockAnalytics.visitors.toLocaleString(),
      change: mockAnalytics.visitorsChange,
      icon: Users,
      isUp: true,
    },
    {
      title: "Page Views",
      value: mockAnalytics.pageviews.toLocaleString(),
      change: mockAnalytics.pageviewsChange,
      icon: MousePointerClick,
      isUp: true,
    },
    {
      title: "Bounce Rate",
      value: mockAnalytics.bounces,
      change: mockAnalytics.bouncesChange,
      icon: BarChart3,
      isUp: false,
    },
  ];

  return (
    <div className="grid divide-y divide-[var(--hairline)] border-y border-[var(--hairline)] md:grid-cols-3 md:divide-x md:divide-y-0">
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="group relative flex flex-col overflow-hidden px-5 py-6 transition-colors hover:bg-white/[0.02]"
          style={
            {
              "--glow-color": metric.isUp
                ? "rgba(52, 211, 153, 0.08)"
                : "rgba(251, 113, 133, 0.08)",
            } as React.CSSProperties
          }
        >
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-bold text-muted-foreground/80">
              {metric.title}
            </h3>
            <div className="text-muted-foreground group-hover:text-foreground transition-colors">
              <metric.icon className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3 relative z-10">
            <span className="text-4xl font-black tracking-tight text-foreground/90">
              {metric.value}
            </span>
            <span
              className={cn(
                "flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                metric.isUp
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-rose-400 bg-rose-500/10 border-rose-500/20",
              )}
            >
              {metric.isUp ? (
                <ArrowUpRight className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3" />
              )}
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
