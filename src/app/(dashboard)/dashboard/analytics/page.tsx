"use client";

import { BarChart3, Users, ArrowUpRight, ArrowDownRight, Globe2, MousePointerClick } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from "recharts";
import { mockAnalytics, mockActivityHistory } from "@/lib/mock";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Deep insights into your platform's traffic and engagement.</p>
        </div>
        <div className="flex bg-muted/30 backdrop-blur-md rounded-lg p-1 border border-border">
          <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-foreground shadow-sm">24H</button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors">7D</button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors">30D</button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Unique Visitors", value: mockAnalytics.visitors.toLocaleString(), change: mockAnalytics.visitorsChange, icon: Users, isUp: true },
          { title: "Page Views", value: mockAnalytics.pageviews.toLocaleString(), change: mockAnalytics.pageviewsChange, icon: MousePointerClick, isUp: true },
          { title: "Bounce Rate", value: mockAnalytics.bounces, change: mockAnalytics.bouncesChange, icon: BarChart3, isUp: false },
        ].map((metric) => (
          <div key={metric.title} className="group relative overflow-hidden rounded-[24px] border border-border bg-card/40 p-6 backdrop-blur-3xl transition-all hover:bg-card/60 hover:shadow-[0_8px_32px_rgba(37,99,235,0.08)]">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-accent transition-all">
                 <metric.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-3 relative z-10">
              <span className="text-4xl font-bold tracking-tight text-foreground">{metric.value}</span>
              <span className={cn(
                "flex items-center text-xs font-medium",
                metric.isUp ? "text-emerald-400" : "text-rose-400"
              )}>
                {metric.isUp ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Traffic Chart */}
      <div className="rounded-[32px] border border-border bg-card/30 backdrop-blur-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-1/4 w-1/2 h-[300px] bg-blue-600/5 blur-[100px] -z-10 rounded-full" />
        <div className="flex items-center justify-between mb-8 relative z-10">
           <div>
              <h3 className="text-lg font-semibold text-foreground">Traffic Overview</h3>
              <p className="text-sm text-muted-foreground mt-1">Daily visitors across all monitored properties.</p>
           </div>
        </div>
        <div className="h-[350px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockActivityHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisits2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Referrers */}
         <div className="rounded-[24px] border border-border bg-card/30 backdrop-blur-3xl p-6 relative overflow-hidden shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-6">Top Referrers</h3>
            <div className="space-y-4 relative z-10">
              {mockAnalytics.topReferrers.map((ref) => (
                <div key={ref.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent/40 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground">{ref.name}</span>
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-bold text-foreground">{ref.visits.toLocaleString()}</span>
                     <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" style={{ width: `${(ref.visits / 10000) * 100}%` }} />
                     </div>
                  </div>
                </div>
              ))}
            </div>
         </div>
         {/* Geography */}
         <div className="rounded-[24px] border border-border bg-card/30 backdrop-blur-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Top Regions</h3>
                <Globe2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-4 relative z-10">
              {mockAnalytics.geography.map((geo) => (
                <div key={geo.code} className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">{geo.code}</span>
                      <span className="text-sm font-medium text-muted-foreground">{geo.country}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{geo.users.toLocaleString()}</span>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}
