"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/features/dashboard";

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div
      className="flex-1 rounded-[28px] bg-background border border-border relative overflow-hidden card-grain inner-glow p-6"
      style={{ "--glow-color": "rgba(168, 85, 247, 0.08)" } as React.CSSProperties}
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple-500/4 blur-2xl ambient-orb pointer-events-none" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <h4 className="text-sm font-bold text-foreground tracking-tight">Recent Activity</h4>
        <Link
          href="/dashboard/logs"
          className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest hover:text-foreground transition-colors flex items-center gap-1"
        >
          See All <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-1 relative z-10">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/2 transition-colors group">
            <div className={cn(
              "h-2 w-2 rounded-full shrink-0 shadow-[0_0_6px_currentColor]",
              item.status === "success" ? "text-emerald-400 bg-emerald-400" :
              item.status === "error" ? "text-rose-400 bg-rose-400" :
              "text-amber-400 bg-amber-400"
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground/80 truncate">
                <span className="text-muted-foreground/60">{item.action}</span>{" "}
                <span className="font-bold">{item.target}</span>
              </p>
            </div>
            <span className="text-[10px] text-muted-foreground/40 font-medium shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
