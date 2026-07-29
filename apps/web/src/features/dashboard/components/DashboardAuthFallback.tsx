import { Bell, ChevronRight, MoreHorizontal, Search } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * A fully static fallback for request-time session verification.
 *
 * This component must not read pathname, params, cookies, headers, or any
 * other request data: Suspense fallbacks render outside the work they guard.
 */
export function DashboardAuthFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "dashboard-shell dashboard-surface min-h-screen bg-[var(--ink)] text-foreground",
        className,
      )}
    >
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-[var(--hairline)] bg-[var(--ink)] lg:flex">
        <SidebarHeaderIdentitySkeleton />
        <div className="px-3 pb-1 pt-3">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-[var(--hairline)] bg-white/[0.015] px-2.5 text-muted-foreground">
            <Search className="size-3.5" />
            <span className="flex-1 text-xs">Search…</span>
            <kbd className="rounded-md border border-[var(--hairline)] bg-white/[0.02] px-1.5 py-0.5 font-geist-mono text-[10px]">
              ⌘K
            </kbd>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="flex-1 px-3 pb-3 pt-1" aria-label="Dashboard">
            <ul className="flex flex-col gap-0.5">
              {DASHBOARD_NAV_ITEMS.map((item) => (
                <li key={item.name}>
                  <div className="flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground">
                    <item.icon
                      className="size-[17px] shrink-0 text-muted-foreground/70"
                      strokeWidth={1.75}
                    />
                    <span className="truncate tracking-[-0.01em]">
                      {item.name}
                    </span>
                    {item.badge ? (
                      <span className="ml-auto rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-geist-mono text-[9px] font-medium uppercase tracking-widest text-accent">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <SidebarFooterIdentitySkeleton />
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 lg:left-[268px]">
        <header className="flex h-14 items-center gap-2.5 border-b border-[var(--hairline)] bg-[var(--ink)]/80 px-5 backdrop-blur-xl">
          <span className="text-[13px] font-medium text-foreground">
            All Projects
          </span>
          <ChevronRight className="size-3.5 text-muted-foreground/40" />
          <span className="text-[13px] font-medium text-foreground">
            Overview
          </span>
        </header>
      </div>

      <div className="lg:pl-[268px]">
        <div className="h-14" aria-hidden="true" />
      </div>
    </div>
  );
}

function SidebarHeaderIdentitySkeleton() {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--hairline)] px-5">
      <span className="size-8 animate-pulse rounded-md bg-white/[0.07]" />
      <span className="min-w-0 flex-1 space-y-2">
        <span className="block h-3 w-24 animate-pulse rounded-sm bg-white/[0.08]" />
        <span className="block h-2 w-12 animate-pulse rounded-sm bg-white/[0.045]" />
      </span>
    </div>
  );
}

function SidebarFooterIdentitySkeleton() {
  return (
    <div className="flex items-center gap-2 border-t border-[var(--hairline)] px-4 py-3">
      <span className="size-7 animate-pulse rounded-full bg-white/[0.07]" />
      <span className="h-3 flex-1 animate-pulse rounded-sm bg-white/[0.07]" />
      <button
        type="button"
        disabled
        aria-label="Account menu loading"
        className="flex size-8 items-center justify-center rounded-full border border-[var(--hairline)] text-muted-foreground/50"
      >
        <MoreHorizontal className="size-4" />
      </button>
      <button
        type="button"
        disabled
        aria-label="Notifications loading"
        className="flex size-8 items-center justify-center rounded-full border border-[var(--hairline)] text-muted-foreground/50"
      >
        <Bell className="size-4" />
      </button>
    </div>
  );
}
