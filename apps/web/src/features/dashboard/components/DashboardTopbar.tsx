"use client";

import { ChevronRight, MailPlus } from "lucide-react";
import { Suspense, use } from "react";
import { Button } from "@/components/ui/button";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { useGlobalMailStore } from "@/features/mail/mail-context";
import {
  type ProjectOption,
  ProjectScopeSwitcher,
} from "./ProjectScopeSwitcher";

interface DashboardTopbarProps {
  mobileNavigation?: React.ReactNode;
  projects?: Promise<ProjectOption[]>;
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
  const sectionSlug = activeSlug === "email" ? "emails" : activeSlug;
  const section =
    DASHBOARD_NAV_ITEMS.find((i) => i.slug === sectionSlug)?.name ?? "Overview";

  const mailStore = useGlobalMailStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2.5 border-b border-[var(--hairline)] bg-[var(--ink)]/80 px-5 backdrop-blur-xl">
      {mobileNavigation}
      {projects ? (
        <Suspense fallback={<ProjectScopeSwitcher />}>
          <ProjectSwitcherData projects={projects} />
        </Suspense>
      ) : (
        <ProjectScopeSwitcher />
      )}
      <ChevronRight className="size-3.5 text-muted-foreground/40" />
      <span className="text-[13px] font-medium text-foreground">{section}</span>

      {activeSlug === "emails" && mailStore ? (
        <div className="ml-auto flex items-center gap-3">
          <DashboardSearchInput
            aria-label="Search mail"
            containerClassName="hidden w-full max-w-xs sm:flex"
            onValueChange={mailStore.setQuery}
            placeholder="Search mail and resources"
            size="sm"
            value={mailStore.query}
          />
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

function ProjectSwitcherData({
  projects,
}: {
  projects: Promise<ProjectOption[]>;
}) {
  return <ProjectScopeSwitcher projects={use(projects)} />;
}
