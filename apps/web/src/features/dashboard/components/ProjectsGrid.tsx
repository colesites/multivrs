"use client";

import dynamic from "next/dynamic";
import { Suspense, use, useState } from "react";
import { ProjectCardsList } from "@/features/dashboard/components/ProjectCardsList";
import {
  type ProjectFilter,
  type ProjectLayout,
  type ProjectSort,
  ProjectsToolbar,
  type ProjectView,
} from "@/features/dashboard/components/ProjectsToolbar";
import {
  ProjectCardsSkeleton,
  ProjectsUsageSkeleton,
} from "@/features/dashboard/components/skeletons/ProjectCardsSkeleton";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

const UsageView = dynamic(() =>
  import("@/features/dashboard/components/UsageView").then(
    (module) => module.UsageView,
  ),
);

interface ProjectsGridProps {
  projects: Promise<DashboardProject[] | null>;
  username: Promise<string>;
  usage: Promise<AccountUsage>;
}

export function ProjectsGrid({ username, projects, usage }: ProjectsGridProps) {
  const [layout, setLayout] = useState<ProjectLayout>("grid");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [sort, setSort] = useState<ProjectSort>("activity");
  const [view, setView] = useState<ProjectView>("projects");
  return (
    <div className="flex flex-1 flex-col gap-5">
      <ProjectsToolbar
        layout={layout}
        filter={filter}
        onFilterChange={setFilter}
        onLayoutChange={setLayout}
        onQueryChange={setQuery}
        onSortChange={setSort}
        onViewChange={setView}
        query={query}
        sort={sort}
        view={view}
      />
      {view === "usage" ? (
        <Suspense fallback={<ProjectsUsageSkeleton />}>
          <UsageView usage={usage} />
        </Suspense>
      ) : (
        <Suspense fallback={<ProjectCardsSkeleton layout={layout} />}>
          <ProjectCardsList
            layout={layout}
            filter={filter}
            projects={projects}
            query={query}
            sort={sort}
            username={username}
          />
        </Suspense>
      )}
    </div>
  );
}
