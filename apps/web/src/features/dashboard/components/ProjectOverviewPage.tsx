import { ArrowUpRight, Settings2 } from "lucide-react";
import Link from "next/link";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
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
    <div className="w-full space-y-6 px-5 py-6">
      <DashboardPageHeader
        title={data.name}
        description={
          <>
            {data.framework ?? "Framework auto-detected"} · Created{" "}
            {new Date(data.createdAt).toLocaleDateString("en-US", {
              dateStyle: "medium",
              timeZone: "UTC",
            })}
          </>
        }
        actions={
          <>
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
          </>
        }
      />

      <ProjectDeploymentSummary base={base} data={data} />
      <ProjectResourceLists base={base} data={data} />
    </div>
  );
}
