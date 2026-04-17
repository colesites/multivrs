"use client";

import Link from "next/link";
import { Settings, Zap, ArrowUpRight } from "lucide-react";

export function SidebarFooter() {
  return (
    <div className="p-4 relative z-10">
      {/* Active Session Dropdown / Settings Link styled differently */}
      <div className="mb-4">
         {/* Section Header */}
         <div className="flex items-center justify-between px-4 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Setup</span>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/20 text-[9px] font-bold text-purple-600 dark:text-purple-300">1</span>
         </div>
         
         <Link href="/dashboard/settings" className="group flex items-center justify-between rounded-[18px] px-4 py-3 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors">
            <div className="flex items-center gap-4">
               <Settings className="h-4 w-4 group-hover:text-foreground transition-colors" />
               <span>Settings</span>
            </div>
         </Link>
      </div>

      {/* Upgrade Card strictly mimicking Activate Super */}
      <div className="relative overflow-hidden rounded-[24px] border border-border bg-card/40 p-5 hover:border-border/80 transition-all cursor-pointer group flex flex-col pt-6 backdrop-blur-sm shadow-xl">
        <div className="relative z-10 flex items-center gap-3 mb-2">
          <Zap className="h-4 w-4 text-foreground fill-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <span className="text-[13px] font-bold text-foreground tracking-wide">Activate Super</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed relative z-10">
          Unlock all features on Multivrs Platform
        </p>
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-4 w-4 text-foreground" />
        </div>
      </div>
    </div>
  );
}
