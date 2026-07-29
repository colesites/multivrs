"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_NAV_GROUPS } from "@/features/dashboard/constants/navigation";
import { cn } from "@/lib/utils";

export function SettingsSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 pt-6 pb-6 space-y-4 relative z-10">
      {SETTINGS_NAV_GROUPS.map((group) => (
        <div key={group.title ?? group.items[0]?.name} className="mb-2">
          {group.title && (
            <div className="mb-3 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {group.title}
            </div>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              // Exact match for /dashboard/settings so we don't accidentally light up "General" when in "Billing"
              const isActive =
                item.href === "/dashboard/settings"
                  ? pathname === "/dashboard/settings"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center justify-between rounded-[18px] px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent/50 text-foreground shadow-xs ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/30",
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10 w-full">
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="tracking-wide text-[13px]">
                      {item.name}
                    </span>
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
