import { Globe2 } from "lucide-react";
import Link from "next/link";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

export function ProjectResourceLists({
  base,
  data,
}: {
  base: string;
  data: ProjectOverviewData;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="border border-[var(--hairline)] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Domains</h2>
          <Globe2 className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-4 divide-y divide-[var(--hairline)]">
          {data.domains.map((domain) => (
            <Link
              key={domain.hostname}
              href={`${base}/domains/${domain.hostname}`}
              className="flex items-center justify-between py-3 text-sm hover:text-blue-300"
            >
              <span>{domain.hostname}</span>
              <span className="text-xs text-muted-foreground">
                {domain.status}
              </span>
            </Link>
          ))}
          {!data.domains.length ? (
            <p className="py-6 text-sm text-muted-foreground">
              No connected domains.
            </p>
          ) : null}
        </div>
      </article>
      <article className="border border-[var(--hairline)] p-5">
        <h2 className="text-sm font-semibold">Recent deployments</h2>
        <div className="mt-4 divide-y divide-[var(--hairline)]">
          {data.recentDeployments.map((item) => (
            <Link
              key={item.id}
              href={`${base}/deployments/${item.id}`}
              className="flex items-center gap-3 py-3 text-sm hover:text-blue-300"
            >
              <span className="size-2 rounded-full bg-current opacity-70" />
              <span className="min-w-0 flex-1 truncate">
                {item.commitSha?.slice(0, 7) ?? "Manual deployment"}
              </span>
              <span className="text-xs capitalize text-muted-foreground">
                {item.status}
              </span>
            </Link>
          ))}
          {!data.recentDeployments.length ? (
            <p className="py-6 text-sm text-muted-foreground">
              No deployments yet.
            </p>
          ) : null}
        </div>
      </article>
    </section>
  );
}
