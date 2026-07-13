"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { DashboardProject } from "@/features/dashboard/types/project.types";

export function LogsProjectPicker({
  username,
  projects,
}: {
  username: string;
  projects: DashboardProject[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      projects.filter((project) =>
        project.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [projects, query],
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-5xl flex-col justify-center px-5 py-12">
      <div className="mb-8 max-w-xl">
        <p className="font-geist-mono text-[11px] uppercase tracking-[0.16em] text-blue-400">
          Runtime observability
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Choose a project to inspect its logs.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Search request, edge, and function events for one project at a time.
        </p>
      </div>
      <div className="border-y border-[var(--hairline)]">
        <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-5 py-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a project…"
            className="h-8 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="font-geist-mono text-xs text-muted-foreground">
            {filtered.length} projects
          </span>
        </div>
        <div className="grid divide-y divide-[var(--hairline)]">
          {filtered.map((project) => (
            <button
              key={project.slug}
              type="button"
              onClick={() => router.push(`/${username}/${project.slug}/logs`)}
              className="group flex items-center gap-4 px-5 py-4 text-left transition-colors hover:text-blue-300"
            >
              <span className="font-geist-mono text-sm text-blue-300">
                {project.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground transition-colors group-hover:text-blue-200">
                  {project.name}
                </span>
                <span className="mt-1 block truncate font-geist-mono text-xs text-muted-foreground">
                  {project.domain}
                </span>
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Open logs
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
