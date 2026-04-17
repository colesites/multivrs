"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/features/dashboard/constants/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 pb-6 space-y-4 relative z-10">
      {NAV_GROUPS.map((group, idx) => (
        <div key={idx} className="mb-2">
          {group.title && (
            <div className="mb-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {group.title}
            </div>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center justify-between rounded-[18px] px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent/50 text-foreground shadow-sm ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10 w-full">
                    <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="tracking-wide text-[13px]">{item.name}</span>
                    {item.name === "Email" && (
                      <span className="ml-auto rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-purple-300">Beta</span>
                    )}
                    {item.name === "Logs" && isActive && (
                      <span className="ml-auto flex h-4 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
