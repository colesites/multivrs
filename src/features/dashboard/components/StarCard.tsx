"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import type { StarCardProps } from "@/features/dashboard";

export function StarCard({
  title, metric, unit, href, icon: Icon,
  glowColor, accentColor, sparklineData, trend, trendUp, delay,
}: StarCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[24px] border border-white/6 bg-background p-0 flex flex-col transition-all duration-500 hover:border-white/12 hover:scale-[1.02] card-grain inner-glow"
      style={{
        "--glow-color": glowColor,
        animationDelay: `${delay * 100}ms`,
      } as React.CSSProperties}
    >
      {/* Top accent stripe */}
      <div
        className="h-[2px] w-full star-glow"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }}
      />

      {/* Ambient glow orb */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: glowColor }}
      />

      {/* Content */}
      <div className="relative z-10 p-5 pb-0 flex-1">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/6 transition-all duration-500 group-hover:scale-110 group-hover:border-white/12"
              style={{ backgroundColor: `${accentColor}10` }}
            >
              <Icon className="h-4.5 w-4.5 text-foreground/70 group-hover:text-foreground transition-colors" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Workspace</p>
              <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-foreground/60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Metric */}
        <div className="mb-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black tabular-nums tracking-tighter text-foreground">{metric}</span>
            <span className="text-xs font-bold text-muted-foreground/40">{unit}</span>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center gap-2 mb-4">
          <div className={cn("flex h-4 w-4 items-center justify-center rounded-full", trendUp ? "bg-emerald-500/15" : "bg-rose-500/15")}>
            {trendUp ? <ArrowUpRight className="h-2.5 w-2.5 text-emerald-400" /> : <ArrowDownRight className="h-2.5 w-2.5 text-rose-400" />}
          </div>
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", trendUp ? "text-emerald-400/80" : "text-rose-400/80")}>{trend}</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-[72px] w-full relative z-0 opacity-60 group-hover:opacity-100 transition-opacity duration-700">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[...sparklineData]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`star-grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={accentColor} strokeWidth={2} fillOpacity={1} fill={`url(#star-grad-${title})`} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="absolute bottom-[30%] left-0 w-full h-px border-b border-dashed border-white/4" />
      </div>

      <div className="absolute inset-0 pointer-events-none scanline-sweep rounded-[24px]" />
    </Link>
  );
}
