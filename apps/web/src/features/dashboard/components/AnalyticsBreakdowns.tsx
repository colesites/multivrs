"use client";

import { mockAnalytics } from "@/lib/mock";
import { AudienceMap } from "./AudienceMap";

export function AnalyticsBreakdowns() {
  return (
    <div className="space-y-8 relative z-10">
      <AudienceMap />
      <div className="grid grid-cols-1 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {/* Referrers */}
        <div className="px-5 py-6 lg:px-7">
          <h3 className="text-[15px] font-bold text-foreground mb-5 tracking-tight">
            Top Referrers
          </h3>
          <div className="space-y-3 relative z-10">
            {mockAnalytics.topReferrers.map((ref) => (
              <div
                key={ref.name}
                className="flex items-center justify-between border-b border-[var(--hairline)] py-3 transition-colors group"
              >
                <span className="text-[13px] font-bold text-muted-foreground/80 group-hover:text-foreground transition-colors">
                  {ref.name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-bold text-foreground">
                    {ref.visits.toLocaleString()}
                  </span>
                  <div className="w-24 h-1 bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                      style={{ width: `${(ref.visits / 10000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-6 lg:px-7">
          <h3 className="text-[15px] font-bold text-foreground">Top regions</h3>
          <div className="mt-4 space-y-2">
            {mockAnalytics.geography.map((geo) => (
              <div
                key={geo.code}
                className="flex items-center justify-between border-b border-[var(--hairline)] py-2.5 text-sm"
              >
                <span className="text-muted-foreground">{geo.country}</span>
                <span className="font-geist-mono text-foreground">
                  {geo.users.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
