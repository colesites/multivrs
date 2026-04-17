"use client";

import { Hexagon, ChevronDown, ArrowUpRight } from "lucide-react";

export function SidebarHeader() {
  return (
    <>
      {/* Workspace Brand Dropdown */}
      <div className="flex h-20 items-center px-6 relative z-10 w-full shrink-0 border-b border-border/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <Hexagon className="h-6 w-6 font-black fill-background" />
            </div>
            <div className="flex flex-col items-start truncate">
              <span className="text-[13px] font-bold tracking-tight text-foreground -mb-0.5">Multivrs</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Pro</span>
            </div>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/50 text-muted-foreground hover:text-foreground hover:bg-accent border border-border/50 transition-all active:scale-95 shadow-sm">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Team / Workspace Switcher Pill */}
      <div className="px-6 pt-6 pb-2">
        <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-accent/30 border border-border/50 hover:bg-accent/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 text-[10px] font-black">P</div>
            <span className="text-xs font-bold text-foreground">Personal</span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Faux Segmented Toggle */}
      <div className="px-6 py-5">
        <div className="flex items-center p-1 bg-muted/30 rounded-2xl border border-border/50">
          <button className="flex-1 py-2.5 text-xs font-semibold text-foreground bg-muted/80 rounded-[14px] shadow-sm">Production</button>
          <button className="flex-1 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">Preview</button>
        </div>
      </div>
    </>
  );
}
