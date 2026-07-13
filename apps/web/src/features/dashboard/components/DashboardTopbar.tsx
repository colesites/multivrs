"use client";

import { ChevronRight } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import {
  type ProjectOption,
  ProjectScopeSwitcher,
} from "./ProjectScopeSwitcher";

interface DashboardTopbarProps {
  projects?: ProjectOption[];
}

/**
 * Global header bar across the content area. Holds the "All Projects" scope
 * switcher and a breadcrumb to the active section.
 */
export function DashboardTopbar({ projects }: DashboardTopbarProps) {
  const { activeSlug } = useDashboardScope();
  const section =
    DASHBOARD_NAV_ITEMS.find((i) => i.slug === activeSlug)?.name ?? "Overview";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2.5 border-b border-[var(--hairline)] bg-[var(--ink)]/80 px-5 backdrop-blur-xl">
      <ProjectScopeSwitcher projects={projects} />
      <ChevronRight className="size-3.5 text-muted-foreground/40" />
      <span className="text-[13px] font-medium text-foreground">{section}</span>
    </header>
  );
}
