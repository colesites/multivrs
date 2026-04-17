"use client";

import { cn } from "@/lib/utils";
import type { MicroStatProps } from "@/features/dashboard";

const COLOR_MAP = {
  emerald: "from-emerald-500/[0.06] to-emerald-500/[0.02] border-emerald-500/[0.08]",
  amber: "from-amber-500/[0.06] to-amber-500/[0.02] border-amber-500/[0.08]",
  blue: "from-blue-500/[0.06] to-blue-500/[0.02] border-blue-500/[0.08]",
  purple: "from-purple-500/[0.06] to-purple-500/[0.02] border-purple-500/[0.08]",
} as const;

export function MicroStat({ label, value, badge, color, subValue }: MicroStatProps) {
  return (
    <div className={cn(
      "bg-linear-to-br border rounded-2xl p-4 flex flex-col justify-between h-[88px] relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300",
      COLOR_MAP[color]
    )}>
      <div className="flex justify-between items-center w-full relative z-10">
        <span className="text-[10px] text-muted-foreground/60 font-bold">{label}</span>
        <span className="bg-white/4 rounded-md px-1.5 py-0.5 text-[9px] text-muted-foreground/40 font-bold">{badge}</span>
      </div>
      <div className="flex items-baseline justify-between relative z-10">
        <span className="text-lg font-bold text-foreground tabular-nums">{value}</span>
        {subValue && (
          <span className="text-[10px] font-bold text-muted-foreground/50">{subValue}</span>
        )}
      </div>
    </div>
  );
}
