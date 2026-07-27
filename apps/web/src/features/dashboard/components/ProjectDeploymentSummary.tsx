import { Activity, GitBranch, Rocket } from "lucide-react";
import Link from "next/link";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

export function ProjectDeploymentSummary({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  const production = data.production;
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="border border-[var(--hairline)] bg-white/[0.015] p-5 md:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Production deployment</h2>
          <Rocket className="size-4 text-muted-foreground" />
        </div>
        {production ? (
          <div className="mt-6 space-y-4">
            <Link
              href={`${base}/deployments/${production.id}`}
              className="text-lg font-medium hover:underline"
            >
              {production.url ?? production.id}
            </Link>
            <div className="flex flex-wrap gap-5 text-xs text-muted-foreground">
              <span className="capitalize text-foreground">
                {production.status}
              </span>
              <span className="flex items-center gap-1">
                <GitBranch className="size-3" /> {production.branch}
              </span>
              <span>{new Date(production.createdAt).toLocaleString()}</span>
            </div>
            {production.errorMessage ? (
              <p className="border border-red-500/25 bg-red-500/5 p-3 text-xs text-red-300">
                {production.errorMessage}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-10 text-sm text-muted-foreground">
            No production deployment yet. Import a repository to create the
            first build.
          </p>
        )}
      </article>
      <article className="border border-[var(--hairline)] bg-white/[0.015] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Last 24 hours</h2>
          <Activity className="size-4 text-muted-foreground" />
        </div>
        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Requests</dt>
            <dd className="mt-1 text-2xl font-semibold">
              {data.analytics.requests.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Average latency</dt>
            <dd className="mt-1">{data.analytics.averageLatency} ms</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Error rate</dt>
            <dd className="mt-1">{data.analytics.errorRate.toFixed(2)}%</dd>
          </div>
        </dl>
        <Link
          href={`${base}/analytics`}
          className="mt-6 inline-flex text-xs text-blue-400 hover:underline"
        >
          Open analytics
        </Link>
      </article>
    </section>
  );
}
