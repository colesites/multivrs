"use client";

import { AnalyticsMetrics } from "./AnalyticsMetrics";
import { AnalyticsChart } from "./AnalyticsChart";
import { AnalyticsBreakdowns } from "./AnalyticsBreakdowns";

export function AnalyticsPage() {
  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Analytics</h2>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">Deep insights into your platform&apos;s traffic and engagement.</p>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex items-center p-1 bg-white/3 rounded-2xl border border-white/6">
          <button className="px-5 py-2 text-xs font-bold text-foreground bg-white/5 rounded-xl shadow-sm border border-white/5">24H</button>
          <button className="px-5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">7D</button>
          <button className="px-5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">30D</button>
        </div>
      </div>

      <AnalyticsMetrics />
      <AnalyticsChart />
      <AnalyticsBreakdowns />
    </div>
  );
}
