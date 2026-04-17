"use client";

import Link from "next/link";
import type { QuickActionProps } from "@/features/dashboard";

export function QuickAction({ icon: Icon, label, href }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl bg-white/2 border border-white/5 p-3 hover:bg-white/6 hover:border-white/10 transition-all duration-300 group"
    >
      <div className="h-8 w-8 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center group-hover:bg-white/8 transition-colors">
        <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
      <span className="text-xs font-bold text-muted-foreground/70 group-hover:text-foreground transition-colors">
        {label}
      </span>
    </Link>
  );
}
