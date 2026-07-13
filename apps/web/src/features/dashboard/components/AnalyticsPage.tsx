"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardProject } from "@/features/dashboard/types/project.types";
import { AnalyticsBreakdowns } from "./AnalyticsBreakdowns";
import { AnalyticsChart } from "./AnalyticsChart";
import { AnalyticsMetrics } from "./AnalyticsMetrics";

interface AnalyticsPageProps {
  username?: string;
  projects?: DashboardProject[];
  project?: DashboardProject;
}

export function AnalyticsPage({
  username,
  projects,
  project,
}: AnalyticsPageProps) {
  if (username && projects && !project) {
    return <AnalyticsProjectPicker username={username} projects={projects} />;
  }

  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both max-w-[1400px] mx-auto px-5 py-7 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4">
        <div>
          <p className="font-geist-mono text-[11px] uppercase tracking-[0.16em] text-blue-400">
            Audience intelligence
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground tracking-tight">
            {project?.name ?? "Analytics"}
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
            Deep insights into your platform&apos;s traffic and engagement.
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center gap-4 border-b border-[var(--hairline)]">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-none border-b-2 border-foreground px-0 text-xs text-foreground"
          >
            24H
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-none px-0 text-xs text-muted-foreground hover:text-foreground"
          >
            7D
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-none px-0 text-xs text-muted-foreground hover:text-foreground"
          >
            30D
          </Button>
        </div>
      </div>

      <AnalyticsMetrics />
      <AnalyticsChart />
      <AnalyticsBreakdowns />
    </div>
  );
}

function AnalyticsProjectPicker({
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
          Audience intelligence
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Explore the audience behind every project.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Choose a project to uncover traffic, acquisition, geography, and
          engagement patterns.
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
          {filtered.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => router.push(`/${username}/${item.slug}/analytics`)}
              className="group flex items-center gap-4 px-5 py-4 text-left transition-colors hover:text-blue-300"
            >
              <span className="font-geist-mono text-sm text-blue-300">
                {item.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground transition-colors group-hover:text-blue-200">
                  {item.name}
                </span>
                <span className="mt-1 block truncate font-geist-mono text-xs text-muted-foreground">
                  {item.domain}
                </span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
