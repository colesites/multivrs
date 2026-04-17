"use client";

import { FolderGit2, Globe, BarChart3, Mail, ChevronDown, Zap, Server, Clock, TrendingUp, Shield } from "lucide-react";
import { StarCard } from "@/features/dashboard";
import { DeploymentMonitor } from "@/features/dashboard";
import { ActivityFeed } from "@/features/dashboard";
import { QuickAction } from "@/features/dashboard";
import { PerfCard } from "@/features/dashboard";
import { SPARKLINE_DATA, RECENT_ACTIVITY } from "@/features/dashboard";

export default function DashboardOverview() {
  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both pb-10 max-w-[1600px] mx-auto px-2 sm:px-6">

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 mb-2">Command Center</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Quick Workspace</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-muted/20 rounded-2xl border border-border/50">
            <button className="px-4 py-2 text-[11px] font-bold text-foreground bg-accent/60 rounded-xl shadow-sm">24H</button>
            <button className="px-4 py-2 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors">7D</button>
            <button className="px-4 py-2 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors">30D</button>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-[11px] font-bold text-foreground hover:bg-white/10 transition-colors">
            Production <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Row 1: Star Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StarCard title="Projects" metric="12" unit="Active" href="/dashboard/projects" icon={FolderGit2} glowColor="rgba(59, 130, 246, 0.25)" accentColor="#3b82f6" sparklineData={SPARKLINE_DATA.projects} trend="+12.4%" trendUp delay={0} />
        <StarCard title="Domains" metric="4" unit="Verified" href="/dashboard/domains" icon={Globe} glowColor="rgba(16, 185, 129, 0.25)" accentColor="#10b981" sparklineData={SPARKLINE_DATA.domains} trend="+8.2%" trendUp delay={1} />
        <StarCard title="Email" metric="3" unit="Routes" href="/dashboard/email" icon={Mail} glowColor="rgba(168, 85, 247, 0.25)" accentColor="#a855f7" sparklineData={SPARKLINE_DATA.email} trend="Active" trendUp delay={2} />
        <StarCard title="Analytics" metric="14.2K" unit="Visitors" href="/dashboard/analytics" icon={BarChart3} glowColor="rgba(245, 158, 11, 0.25)" accentColor="#f59e0b" sparklineData={SPARKLINE_DATA.analytics} trend="+24%" trendUp delay={3} />
      </div>

      {/* Row 2: Deployment Monitor + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <DeploymentMonitor />

        <div className="flex flex-col gap-5">
          <ActivityFeed items={RECENT_ACTIVITY} />

          {/* Quick Actions */}
          <div className="rounded-[28px] bg-background border border-border relative overflow-hidden card-grain inner-glow p-6" style={{ "--glow-color": "rgba(16, 185, 129, 0.08)" } as React.CSSProperties}>
            <h4 className="text-sm font-bold text-foreground tracking-tight mb-4 relative z-10">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <QuickAction icon={FolderGit2} label="New Project" href="/dashboard/projects" />
              <QuickAction icon={Globe} label="Add Domain" href="/dashboard/domains" />
              <QuickAction icon={Shield} label="Security" href="/dashboard/settings" />
              <QuickAction icon={Zap} label="Upgrade" href="/dashboard/billing" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Performance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerfCard icon={TrendingUp} label="Uptime" value="99.99%" sub="Last 90 days" color="emerald" />
        <PerfCard icon={Zap} label="Bandwidth" value="1.2 TB" sub="+12.4% this week" color="blue" />
        <PerfCard icon={Server} label="Deployments" value="142" sub="+2 today" color="purple" />
        <PerfCard icon={Clock} label="Avg Build" value="43s" sub="↓ 8s from last week" color="amber" />
      </div>
    </div>
  );
}
