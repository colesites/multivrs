"use client";

import { ArrowLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SettingsSidebarHeader() {
  return (
    <>
      {/* Back to Dashboard Button */}
      <div className="flex h-20 items-center px-6 relative z-10 w-full shrink-0 border-b border-border/50">
        <Button
          variant="ghost"
          className="group flex h-auto items-center gap-2 p-0 text-sm font-bold text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 bg-accent/30 shadow-sm transition-colors group-hover:bg-accent">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span>Back to Dashboard</span>
        </Button>
      </div>

      {/* Settings Context Pill */}
      <div className="px-6 pt-6 pb-2">
        <div className="w-full flex flex-col items-start px-1">
          <div className="flex items-center gap-3 w-full">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Settings2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[15px] font-black tracking-tight text-foreground">
                Project Settings
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                multivrs-pro
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
