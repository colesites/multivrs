"use client";

import { Globe2 } from "lucide-react";
import { mockAnalytics } from "@/lib/mock";

export function AnalyticsBreakdowns() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
       {/* Referrers */}
       <div className="rounded-[28px] border border-white/6 bg-background relative overflow-hidden card-grain shadow-xl p-6 lg:p-8">
          {/* Subtle glow */}
          <div className="absolute top-0 left-0 w-full h-[150px] bg-white/2 blur-[60px] -z-10 rounded-full pointer-events-none" />
          
          <h3 className="text-[15px] font-bold text-foreground mb-6 tracking-tight">Top Referrers</h3>
          <div className="space-y-3 relative z-10">
            {mockAnalytics.topReferrers.map((ref) => (
              <div key={ref.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/2 border border-transparent hover:border-white/5 transition-colors group">
                <span className="text-[13px] font-bold text-muted-foreground/80 group-hover:text-foreground transition-colors">{ref.name}</span>
                <div className="flex items-center gap-4">
                   <span className="text-[13px] font-bold text-foreground">{ref.visits.toLocaleString()}</span>
                   <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
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

       {/* Geography */}
       <div className="rounded-[28px] border border-white/6 bg-background relative overflow-hidden card-grain shadow-xl p-6 lg:p-8">
          {/* Ambient globe glow */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/3 blur-[80px] -z-10 rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-[15px] font-bold text-foreground tracking-tight">Top Regions</h3>
              <div className="h-8 w-8 rounded-[10px] bg-white/3 border border-white/6 flex items-center justify-center">
                 <Globe2 className="h-4 w-4 text-muted-foreground" />
              </div>
          </div>
          <div className="space-y-3 relative z-10">
            {mockAnalytics.geography.map((geo) => (
              <div key={geo.code} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/2 border border-transparent hover:border-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-white/5 border border-white/5 text-[10px] font-black text-foreground shadow-sm">{geo.code}</span>
                    <span className="text-[13px] font-bold text-muted-foreground/80 group-hover:text-foreground transition-colors">{geo.country}</span>
                </div>
                <span className="text-[13px] font-black text-foreground">{geo.users.toLocaleString()}</span>
              </div>
            ))}
          </div>
       </div>
    </div>
  );
}
