"use client";

import { BarChart3, Users, ArrowUpRight, ArrowDownRight, MousePointerClick } from "lucide-react";
import { mockAnalytics } from "@/lib/mock";
import { cn } from "@/lib/utils";

export function AnalyticsMetrics() {
  const metrics = [
    { title: "Unique Visitors", value: mockAnalytics.visitors.toLocaleString(), change: mockAnalytics.visitorsChange, icon: Users, isUp: true },
    { title: "Page Views", value: mockAnalytics.pageviews.toLocaleString(), change: mockAnalytics.pageviewsChange, icon: MousePointerClick, isUp: true },
    { title: "Bounce Rate", value: mockAnalytics.bounces, change: mockAnalytics.bouncesChange, icon: BarChart3, isUp: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <div 
          key={metric.title} 
          className="group relative flex flex-col rounded-[24px] border border-white/6 bg-background overflow-hidden transition-all duration-500 hover:border-white/10 hover:scale-[1.02] card-grain inner-glow p-6"
          style={{ "--glow-color": metric.isUp ? "rgba(52, 211, 153, 0.08)" : "rgba(251, 113, 133, 0.08)" } as React.CSSProperties}
        >
          {/* Top accent line */}
          <div className={cn("absolute inset-x-0 -top-px h-[2px] bg-linear-to-r from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 star-glow", metric.isUp ? "via-emerald-500/50" : "via-rose-500/50")} />

          {/* Ambient glow orb */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/4 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-sm font-bold text-muted-foreground/80">{metric.title}</h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/3 border border-white/6 text-muted-foreground group-hover:text-foreground group-hover:bg-white/6 transition-all duration-300">
               <metric.icon className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3 relative z-10">
            <span className="text-4xl font-black tracking-tight text-foreground/90">{metric.value}</span>
            <span className={cn(
              "flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
              metric.isUp ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border-rose-500/20"
            )}>
              {metric.isUp ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
