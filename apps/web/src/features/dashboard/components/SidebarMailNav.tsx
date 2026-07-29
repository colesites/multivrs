"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import {
  useGlobalMailStore,
  useOptionalMailContext,
} from "@/features/mail/mail-context";
import {
  MAIL_NAVIGATION,
  type MailView,
} from "@/features/mail/mail-navigation";
import { cn } from "@/lib/utils";

/**
 * Contextual mail navigation that replaces the default sidebar nav items
 * when the user enters the Emails section. Designed to slot into the
 * existing Sidebar's middle zone, inheriting its width and design tokens.
 */
export function SidebarMailNav() {
  const pathname = usePathname();
  const { username, scope } = useDashboardScope();
  const localContext = useOptionalMailContext();
  const globalContext = useGlobalMailStore();
  const ctx = localContext ?? globalContext;

  const backHref = scope === "~" ? `/${username}` : `/${username}/${scope}`;

  const routeView = pathname.includes("/email/domains/")
    ? "domains"
    : "overview";
  const view = ctx?.view ?? routeView;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Back link */}
      <div className="px-3 pt-2 pb-1">
        <Link
          href={backHref}
          className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
            strokeWidth={1.75}
          />
          <span>Back</span>
        </Link>
      </div>

      {/* Compose button */}
      <div className="px-3 pb-2 pt-1">
        {ctx ? (
          <Button
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            onClick={ctx.openCompose}
            size="sm"
          >
            Compose
          </Button>
        ) : (
          <Link
            className={buttonVariants({
              className:
                "w-full bg-foreground text-background hover:bg-foreground/90",
              size: "sm",
            })}
            href={`/${username}/${scope}/emails?view=inbox&compose=1`}
          >
            Compose
          </Link>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 hide-scrollbar">
        <ul className="flex flex-col gap-0.5">
          {MAIL_NAVIGATION.map((item) => {
            if ("divider" in item) {
              return (
                <li key={item.divider}>
                  <p className="mb-0.5 mt-4 px-3 font-geist-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40">
                    {item.divider}
                  </p>
                </li>
              );
            }
            const Icon = item.icon;
            const count =
              "count" in item && ctx
                ? ctx.data.folderCounts[
                    item.count as keyof typeof ctx.data.folderCounts
                  ]
                : undefined;
            const isActive = view === item.view;
            const href = `/${username}/${scope}/emails?view=${item.view}`;
            return (
              <li key={item.view}>
                <Link
                  href={href}
                  onClick={(event) => {
                    if (!ctx) return;
                    event.preventDefault();
                    ctx.setView(item.view as MailView);
                  }}
                  className={cn(
                    "group relative flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] transition-colors duration-150",
                    isActive
                      ? "nav-rail-active bg-accent/12 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.025] hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[17px] shrink-0 transition-colors",
                      isActive
                        ? "text-accent"
                        : "text-muted-foreground/70 group-hover:text-foreground",
                    )}
                    strokeWidth={1.75}
                  />
                  <span className="truncate tracking-[-0.01em]">
                    {item.label}
                  </span>
                  {count ? (
                    <span className="ml-auto font-geist-mono text-[10px] text-muted-foreground/50">
                      {count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
