"use client";

import { BarChart3, LayoutGrid, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { buildNavHref } from "@/features/dashboard/constants/navigation";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import { ProjectCard } from "./ProjectCard";
import { UsageView } from "./UsageView";

interface ProjectsGridProps {
  username: string;
  projects: DashboardProject[];
}

export function ProjectsGrid({ username, projects }: ProjectsGridProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"projects" | "usage">("projects");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.domain.toLowerCase().includes(q),
    );
  }, [projects, query]);

  return (
    <div className="flex flex-1 flex-col gap-5">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground text-[14px] font-semibold">
            <span>{view === "projects" ? "All Projects" : "Usage"}</span>
            <span className="opacity-50 font-normal">⬍</span>
          </div>
          <div className="flex items-center rounded-lg border border-[var(--hairline)] bg-black/20 p-1 text-xs">
            <button
              type="button"
              onClick={() => setView("projects")}
              className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 transition-colors ${view === "projects" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="size-3.5" /> Projects
            </button>
            <button
              type="button"
              onClick={() => setView("usage")}
              className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 transition-colors ${view === "usage" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <BarChart3 className="size-3.5" /> Usage
            </button>
          </div>
        </div>

        {view === "projects" ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 flex-1 items-center gap-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--ink-raised)]/60 px-3.5 backdrop-blur-md transition-colors focus-within:border-[var(--hairline-strong)]">
              <Search className="size-3.5 shrink-0 text-muted-foreground/70" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Projects..."
                aria-label="Search projects"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground caret-accent outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-label="Filter projects"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--hairline)] bg-background text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  aria-hidden="true"
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.5 3C4.67157 3 4 3.67157 4 4.5C4 5.32843 4.67157 6 5.5 6C6.32843 6 7 5.32843 7 4.5C7 3.67157 6.32843 3 5.5 3ZM3 5C3.01671 5 3.03323 4.99918 3.04952 4.99758C3.28022 6.1399 4.28967 7 5.5 7C6.71033 7 7.71978 6.1399 7.95048 4.99758C7.96677 4.99918 7.98329 5 8 5H13.5C13.7761 5 14 4.77614 14 4.5C14 4.22386 13.7761 4 13.5 4H8C7.98329 4 7.96677 4.00082 7.95048 4.00242C7.71978 2.86009 6.71033 2 5.5 2C4.28967 2 3.28022 2.86009 3.04952 4.00242C3.03323 4.00082 3.01671 4 3 4H1.5C1.22386 4 1 4.22386 1 4.5C1 4.77614 1.22386 5 1.5 5H3ZM11.9505 10.9976C11.7198 12.1399 10.7103 13 9.5 13C8.28967 13 7.28022 12.1399 7.04952 10.9976C7.03323 10.9992 7.01671 11 7 11H1.5C1.22386 11 1 10.7761 1 10.5C1 10.2239 1.22386 10 1.5 10H7C7.01671 10 7.03323 10.0008 7.04952 10.0024C7.28022 8.8601 8.28967 8 9.5 8C10.7103 8 11.7198 8.8601 11.9505 10.0024C11.9668 10.0008 11.9833 10 12 10H13.5C13.7761 10 14 10.2239 14 10.5C14 10.7761 13.7761 11 13.5 11H12C11.9833 11 11.9668 10.9992 11.9505 10.9976ZM9.5 9C8.67157 9 8 9.67157 8 10.5C8 11.3284 8.67157 12 9.5 12C10.3284 12 11 11.3284 11 10.5C11 9.67157 10.3284 9 9.5 9Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <div className="flex h-9 items-center rounded-lg border border-[var(--hairline)] bg-background overflow-hidden text-muted-foreground">
                <button
                  type="button"
                  aria-label="List view"
                  className="flex h-full w-9 items-center justify-center hover:bg-white/5 transition-colors text-foreground bg-white/5 border-r border-[var(--hairline)]"
                >
                  <svg
                    aria-hidden="true"
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Grid view"
                  className="flex h-full w-9 items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <svg
                    aria-hidden="true"
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.15 1.5C2.23873 1.5 1.5 2.23873 1.5 3.15V5.85C1.5 6.76127 2.23873 7.5 3.15 7.5H5.85C6.76127 7.5 7.5 6.76127 7.5 5.85V3.15C7.5 2.23873 6.76127 1.5 5.85 1.5H3.15ZM2.5 3.15C2.5 2.79101 2.79101 2.5 3.15 2.5H5.85C6.20899 2.5 6.5 2.79101 6.5 3.15V5.85C6.5 6.20899 6.20899 6.5 5.85 6.5H3.15C2.79101 6.5 2.5 6.20899 2.5 5.85V3.15ZM3.15 9C2.23873 9 1.5 9.73873 1.5 10.65V13.35C1.5 14.2613 2.23873 15 3.15 15H5.85C6.76127 15 7.5 14.2613 7.5 13.35V10.65C7.5 9.73873 6.76127 9 5.85 9H3.15ZM2.5 10.65C2.5 10.291 2.79101 10 3.15 10H5.85C6.20899 10 6.5 10.291 6.5 10.65V13.35C6.5 13.709 6.20899 14 5.85 14H3.15C2.79101 14 2.5 13.709 2.5 13.35V10.65ZM9 3.15C9 2.23873 9.73873 1.5 10.65 1.5H13.35C14.2613 1.5 15 2.23873 15 3.15V5.85C15 6.76127 14.2613 7.5 13.35 7.5H10.65C9.73873 7.5 9 6.76127 9 5.85V3.15ZM10.65 2.5C10.291 2.5 10 2.79101 10 3.15V5.85C10 6.20899 10.291 6.5 10.65 6.5H13.35C13.709 6.5 14 6.20899 14 5.85V3.15C14 2.79101 13.709 2.5 13.35 2.5H10.65ZM10.65 9C9.73873 9 9 9.73873 9 10.65V13.35C9 14.2613 9.73873 15 10.65 15H13.35C14.2613 15 15 14.2613 15 13.35V10.65C15 9.73873 14.2613 9 13.35 9H10.65ZM10 10.65C10 10.291 10.291 10 10.65 10H13.35C13.709 10 14 10.291 14 10.65V13.35C14 13.709 13.709 14 13.35 14H10.65C10.291 14 10 13.709 10 13.35V10.65Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
              <button
                type="button"
                className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-foreground px-4 text-[13px] font-semibold text-background transition-opacity hover:opacity-90"
              >
                Add New...
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {view === "usage" ? (
        <UsageView />
      ) : projects.length === 0 ? (
        <div className="mt-2 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--hairline-strong)] bg-white/[0.015] px-6 text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--hairline)] bg-white/[0.03]">
            <Plus className="size-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-[18px] font-medium text-foreground">
            No projects yet
          </h3>
          <p className="mt-2 max-w-[400px] text-[14px] text-muted-foreground">
            Create your first project to get started. Connect your repository,
            set up your framework, and deploy in seconds.
          </p>
          <button
            type="button"
            className="mt-8 flex h-10 items-center gap-2 rounded-lg bg-foreground px-5 text-[13px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" strokeWidth={2} />
            Create Project
          </button>
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              href={buildNavHref(username, project.slug, "")}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex min-h-[240px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--hairline-strong)] bg-[var(--ink-raised)]/40 text-center backdrop-blur-md">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.02] border border-white/5">
            <Search className="size-5 text-muted-foreground/50" />
          </div>
          <h3 className="text-[16px] font-medium text-foreground">
            No results found
          </h3>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            No projects match the search “{query}”.
          </p>
        </div>
      )}
    </div>
  );
}
