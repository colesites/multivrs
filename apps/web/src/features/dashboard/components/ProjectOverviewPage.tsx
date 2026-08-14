import { ArrowUpRight, Settings2 } from "lucide-react";
import Link from "next/link";
import { ProjectDeploymentSummary } from "@/features/dashboard/components/ProjectDeploymentSummary";
import { ProjectResourceLists } from "@/features/dashboard/components/ProjectResourceLists";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

function absoluteUrl(value: string): string {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export function ProjectOverviewPage({
  data,
  username,
}: {
  data: ProjectOverviewData;
  username: string;
}) {
  const base = `/${username}/${data.slug}`;
  const production = data.production;
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-5 py-8">
      <header className="flex flex-col gap-5 border-b border-[var(--hairline)] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-purple-400">
            {data.framework ?? "Auto detected"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {data.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Created{" "}
            {new Date(data.createdAt).toLocaleDateString("en-US", {
              dateStyle: "medium",
              timeZone: "UTC",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`${base}/settings`}
            className="inline-flex h-9 items-center gap-2 border border-[var(--hairline)] px-3 text-xs font-medium hover:bg-white/[0.04]"
          >
            <Settings2 className="size-4" /> Settings
          </Link>
          {production?.url ? (
            <a
              href={absoluteUrl(production.url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 bg-foreground px-3 text-xs font-medium text-background"
            >
              <ArrowUpRight className="size-4" /> Visit
            </a>
          ) : null}
        </div>
      </header>

      <ProjectDeploymentSummary base={base} data={data} />
      <ProjectResourceLists base={base} data={data} />
    </div>
  );
}
