"use client";

import { ChevronRight, Search, MailPlus } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import {
  type ProjectOption,
  ProjectScopeSwitcher,
} from "./ProjectScopeSwitcher";
import { useGlobalMailStore } from "@/features/mail/mail-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DashboardTopbarProps {
  mobileNavigation?: React.ReactNode;
  projects?: ProjectOption[];
}

/**
 * Global header bar across the content area. Holds the "All Projects" scope
 * switcher and a breadcrumb to the active section.
 */
export function DashboardTopbar({
  mobileNavigation,
  projects,
}: DashboardTopbarProps) {
  const { activeSlug } = useDashboardScope();
  const section =
    DASHBOARD_NAV_ITEMS.find((i) => i.slug === activeSlug)?.name ?? "Overview";

  const mailStore = useGlobalMailStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2.5 border-b border-[var(--hairline)] bg-[var(--ink)]/80 px-5 backdrop-blur-xl">
      {mobileNavigation}
      <ProjectScopeSwitcher projects={projects} />
      <ChevronRight className="size-3.5 text-muted-foreground/40" />
      <span className="text-[13px] font-medium text-foreground">{section}</span>

      {activeSlug === "emails" && mailStore ? (
        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden w-full max-w-xs sm:block">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40" />
            <Input
              aria-label="Search mail"
              className="h-8 border-[var(--hairline)] bg-white/[0.02] pl-9 text-xs"
              onChange={(event) => mailStore.setQuery(event.target.value)}
              placeholder="Search mail and resources"
              value={mailStore.query}
            />
          </div>
          <Button
            className="hidden sm:flex h-8 bg-white text-black hover:bg-white/90"
            onClick={mailStore.openCompose}
            size="sm"
          >
            <MailPlus className="mr-2 size-3.5" />
            Compose
          </Button>
        </div>
      ) : null}
    </header>
  );
}
