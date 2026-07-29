"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { ProjectCard } from "@/features/dashboard/components/ProjectCard";
import type {
  ProjectFilter,
  ProjectLayout,
  ProjectSort,
} from "@/features/dashboard/components/ProjectsToolbar";
import { buildNavHref } from "@/features/dashboard/constants/navigation";
import type { DashboardProject } from "@/features/dashboard/types/project.types";

interface ProjectCardsListProps {
  layout: ProjectLayout;
  filter: ProjectFilter;
  projects: Promise<DashboardProject[] | null>;
  query: string;
  sort: ProjectSort;
  username: Promise<string>;
}

export function ProjectCardsList({
  layout,
  filter,
  projects: projectsPromise,
  query,
  sort,
  username: usernamePromise,
}: ProjectCardsListProps) {
  const projects = use(projectsPromise) ?? [];
  const username = use(usernamePromise);
  const normalized = query.trim().toLowerCase();
  const filtered = projects
    .filter(
      (project) =>
        (filter === "all" || project.status === filter) &&
        (!normalized ||
          project.name.toLowerCase().includes(normalized) ||
          project.siteLabel?.toLowerCase().includes(normalized) ||
          project.repositoryLabel?.toLowerCase().includes(normalized)),
    )
    .slice()
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : 0));

  if (!projects.length) return <EmptyProjects />;
  if (!filtered.length) return <NoMatchingProjects />;

  return (
    <div
      className={
        layout === "grid"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          : "grid grid-cols-1 gap-3"
      }
    >
      {filtered.map((project) => (
        <ProjectCard
          key={project.slug}
          project={project}
          href={buildNavHref(username, project.slug, "")}
        />
      ))}
    </div>
  );
}

function EmptyProjects() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--hairline-strong)] bg-white/[0.015] px-6 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-full border border-[var(--hairline)]">
        <Plus className="size-6 text-muted-foreground" />
      </span>
      <h2 className="text-lg font-medium">No projects yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Import a repository, confirm its framework, and deploy your first
        application.
      </p>
      <Link
        href="/new"
        className="mt-7 inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-5 text-sm font-semibold text-background"
      >
        <Plus className="size-4" /> Create project
      </Link>
    </div>
  );
}

function NoMatchingProjects() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-[var(--hairline-strong)] text-center">
      <Search className="size-5 text-muted-foreground" />
      <h2 className="mt-3 text-base font-medium">No matching projects</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Try a different search or filter.
      </p>
    </div>
  );
}
