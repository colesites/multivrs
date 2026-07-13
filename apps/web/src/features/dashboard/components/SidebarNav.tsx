"use client";

import Link from "next/link";
import {
  buildNavHref,
  DASHBOARD_NAV_ITEMS,
} from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const { username, scope, activeSlug } = useDashboardScope();

  return (
    <nav className="flex-1 px-3 pb-3 pt-1">
      <ul className="flex flex-col gap-0.5">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = activeSlug === item.slug;
          return (
            <li key={item.name}>
              <Link
                href={buildNavHref(username, scope, item.slug)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "nav-item group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors duration-150",
                  isActive
                    ? "nav-rail-active bg-accent/12 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.025] hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "size-[17px] shrink-0 transition-colors",
                    isActive
                      ? "text-accent"
                      : "text-muted-foreground/70 group-hover:text-foreground",
                  )}
                  strokeWidth={1.75}
                />
                <span className="truncate tracking-[-0.01em]">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-geist-mono text-[9px] font-medium uppercase tracking-widest text-accent">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
