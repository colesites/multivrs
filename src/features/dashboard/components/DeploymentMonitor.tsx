"use client";

import { ArrowUpRight, Globe, MoreHorizontal, Server } from "lucide-react";
import { MicroStat } from "@/features/dashboard";

export function DeploymentMonitor() {
  return (
    <div
      className="xl:col-span-2 rounded-[28px] bg-background border border-border relative overflow-hidden card-grain scanline-sweep inner-glow"
      style={{ "--glow-color": "rgba(59, 130, 246, 0.12)" } as React.CSSProperties}
    >
      {/* Ambient orbs */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-blue-500/4 blur-[80px] ambient-orb pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500/3 blur-[60px] ambient-orb pointer-events-none" style={{ animationDelay: "-4s" }} />

      <div className="relative z-10 p-7 sm:p-9">
        {/* Header */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-[0.2em] mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span>Live Monitor</span>
          <span className="ml-auto text-muted-foreground/40 normal-case tracking-normal font-medium">Updated 2 min ago</span>
        </div>

        {/* Title Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/8 flex items-center justify-center">
              <Server className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Kontinue Prod Node</h3>
              <p className="text-xs text-muted-foreground/50 font-medium mt-0.5">us-east-1 · c5.2xlarge</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/3 border border-white/6 hover:bg-white/8 transition-colors">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/3 border border-white/6 hover:bg-white/8 transition-colors">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="h-9 px-4 flex items-center justify-center rounded-xl bg-white/3 border border-white/6 hover:bg-white/8 transition-colors text-xs font-bold text-foreground gap-2">
              View Topology <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Primary Metric */}
        <div className="flex flex-wrap items-end gap-6 pb-8 border-b border-white/4">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">Active Memory</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl sm:text-6xl font-black tabular-nums tracking-tighter text-foreground">14.3</span>
              <span className="text-2xl font-bold text-muted-foreground/40">GB</span>
            </div>
          </div>
          <div className="flex gap-3 mb-2">
            <button className="rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/20 px-5 py-2.5 text-xs font-bold hover:bg-purple-500/25 transition-colors">
              Vertical Scale
            </button>
            <button className="rounded-xl bg-white/4 text-foreground/80 border border-white/8 px-5 py-2.5 text-xs font-bold hover:bg-white/8 transition-colors">
              Restart Node
            </button>
          </div>
        </div>

        {/* Micro Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <MicroStat label="Error Rate" value="-0.82%" badge="24H" color="emerald" />
          <MicroStat label="Memory Ceiling" value="32.00 GB" badge="24H" color="amber" subValue="+1.09%" />
          <MicroStat label="Request Ratio" value="60.6%" badge="24H" color="blue" />
          <MicroStat label="Latency P95" value="45ms" badge="24H" color="purple" subValue="↓ from 52ms" />
        </div>
      </div>
    </div>
  );
}
