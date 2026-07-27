import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { DashboardProject } from "@/features/dashboard/types/project.types";

export function ProjectSectionPicker({
  username,
  section,
  title,
  description,
  projects,
}: {
  username: string;
  section: string;
  title: string;
  description: string;
  projects: DashboardProject[];
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-12">
      <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-blue-400">
        Project configuration
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 border-y border-[var(--hairline)]">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/${username}/${project.slug}/${section}`}
            className="group flex items-center gap-4 border-b border-[var(--hairline)] px-5 py-4 transition-colors last:border-0 hover:bg-white/[0.025]"
          >
            <span className="flex size-9 items-center justify-center rounded-lg border border-[var(--hairline)] font-geist-mono text-sm text-blue-300">
              {project.name.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">
                {project.name}
              </span>
              <span className="mt-1 block truncate font-geist-mono text-xs text-muted-foreground">
                {project.domain}
              </span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
          </Link>
        ))}
        {!projects.length && (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            Create a project first.
          </p>
        )}
      </div>
    </div>
  );
}
