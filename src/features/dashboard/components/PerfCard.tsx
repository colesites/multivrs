"use client";

import { cn } from "@/lib/utils";
import type { PerfCardProps } from "@/features/dashboard";

const ACCENT_MAP = {
  emerald: { dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" },
  blue: { dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" },
  purple: { dot: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]" },
  amber: { dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" },
} as const;

export function PerfCard({ icon: Icon, label, value, sub, color }: PerfCardProps) {
  return (
    <div className="rounded-2xl bg-white/1.5 border border-white/5 p-4 flex items-center gap-4 hover:bg-white/3 hover:border-white/8 transition-all duration-300 group">
      <div className="h-10 w-10 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center shrink-0 group-hover:bg-white/6 transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black tabular-nums text-foreground tracking-tight">{value}</span>
          <span className="text-[10px] font-medium text-muted-foreground/40 truncate">{sub}</span>
        </div>
      </div>
      <div className={cn("h-2 w-2 rounded-full shrink-0", ACCENT_MAP[color].dot)} />
    </div>
  );
}
