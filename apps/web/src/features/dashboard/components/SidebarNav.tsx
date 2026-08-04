"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  buildNavHref,
  DASHBOARD_NAV_ITEMS,
} from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { cn } from "@/lib/utils";

export function SidebarNav({
  onLinkClick,
}: {
  onLinkClick?: (slug: string) => void;
} = {}) {
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
                onClick={(e) => {
                  if (isActive) {
                    e.preventDefault();
                  }
                  onLinkClick?.(item.slug);
                }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "nav-item group relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors duration-150",
                  isActive
                    ? "nav-rail-active bg-white/8 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-white/2.5 hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4.25 shrink-0 transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground/70 group-hover:text-foreground",
                  )}
                  strokeWidth={1.75}
                />
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate tracking-[-0.01em]">{item.name}</span>
                  {item.badge && (
                    <span className="shrink-0 rounded-lg border border-accent/20 bg-accent/10 px-1.5 py-px text-[9.5px] font-medium text-accent">
                      {item.badge}
                    </span>
                  )}
                </div>
                {(item.slug === "emails" || item.slug === "observability") && (
                  <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/80" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
