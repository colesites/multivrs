"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { ProjectFavicon } from "@/features/dashboard/components/ProjectFavicon";
import { DASHBOARD_NAV_ITEMS } from "@/features/dashboard/constants/navigation";
import type { DashboardProject } from "@/features/dashboard/types/project.types";

const SECTION_ICONS = new Map(
  DASHBOARD_NAV_ITEMS.map((item) => {
    const Icon = item.icon;
    return [
      item.slug,
      <Icon
        className="size-4"
        key={item.slug || "projects"}
        strokeWidth={1.7}
      />,
    ] as const;
  }),
);
const FALLBACK_SECTION_ICON = <Activity className="size-4" strokeWidth={1.7} />;

export function ProjectSectionPicker({
  username,
  section,
  title,
  projects,
}: {
  username: string;
  section: string;
  title: string;
  projects: DashboardProject[];
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProjects = normalizedQuery
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(normalizedQuery),
      )
    : projects;

  return (
    <ProjectPickerShell section={section} title={title}>
      <DashboardSearchInput
        value={query}
        onValueChange={setQuery}
        placeholder="Find Project…"
        size="lg"
      />
      <div className="mt-2 max-h-[22rem] overflow-y-auto pr-1">
        {filteredProjects.length ? (
          <div className="space-y-0.5">
            {filteredProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/${username}/${project.slug}/${section}`}
                className="group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/[0.07] focus-visible:bg-white/[0.07] focus-visible:outline-hidden"
              >
                <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-black ring-1 ring-white/5">
                  <ProjectFavicon
                    className="size-5 rounded-md"
                    name={project.name}
                    url={project.faviconUrl}
                  />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-foreground/85 transition-colors group-hover:text-foreground">
                  {project.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            {projects.length
              ? "No projects match your search."
              : "Create a project first."}
          </p>
        )}
      </div>
    </ProjectPickerShell>
  );
}

export function ProjectSectionPickerSkeleton({
  section,
  title,
}: {
  section: string;
  title: string;
}) {
  return (
    <ProjectPickerShell section={section} title={title}>
      <div className="flex h-11 items-center rounded-lg border border-[var(--hairline)] bg-[var(--ink-raised)]/60 px-3 text-sm text-muted-foreground/70">
        Find Project…
      </div>
      <div
        aria-label="Loading projects"
        className="mt-2 space-y-0.5"
        role="status"
      >
        {["one", "two", "three", "four", "five", "six"].map((key) => (
          <div
            className="flex h-10 animate-pulse items-center gap-3 rounded-lg px-3"
            key={key}
          >
            <span className="size-5 rounded-md bg-white/[0.07]" />
            <span className="h-3 w-2/5 rounded-sm bg-white/[0.055]" />
          </div>
        ))}
      </div>
    </ProjectPickerShell>
  );
}

function ProjectPickerShell({
  children,
  section,
  title,
}: {
  children: React.ReactNode;
  section: string;
  title: string;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-8 text-center">
        <span className="mx-auto flex size-9 items-center justify-center rounded-lg border border-[var(--hairline-strong)] bg-[var(--ink-raised)]/70 text-muted-foreground shadow-lg shadow-black/20">
          {SECTION_ICONS.get(section) ?? FALLBACK_SECTION_ICON}
        </span>
        <h1 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
          Continue to {title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a project to continue
        </p>
      </div>
      {children}
    </main>
  );
}
