import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dashboardDeploymentDetail } from "@/lib/services/deployment-detail.service";

interface PageProps {
  params: Promise<{ username: string; scope: string; deploymentId: string }>;
}

export default async function DeploymentDetailPage({ params }: PageProps) {
  const { username, scope, deploymentId } = await params;
  const deployment = await dashboardDeploymentDetail(
    username,
    scope,
    deploymentId,
  );
  if (!deployment) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8">
      <Link
        href={`/${username}/${scope}/deployments`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Deployments
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-sm text-muted-foreground">{deployment.project}</p>
          <h1 className="mt-1 text-2xl font-semibold">Deployment logs</h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {deployment.id}
          </p>
        </div>
        {deployment.url ? (
          <a
            href={deployment.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 border border-border px-3 text-sm hover:bg-muted"
          >
            Open <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>
      {deployment.errorMessage ? (
        <p className="mt-6 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
          {deployment.errorMessage}
        </p>
      ) : null}
      <div className="mt-6 overflow-hidden border border-border bg-black font-mono text-xs">
        {deployment.logs.length ? (
          deployment.logs.map((log) => (
            <div
              key={log.id}
              className="grid grid-cols-[7rem_4rem_1fr] gap-3 border-b border-white/10 p-3"
            >
              <time className="text-white/40">
                {new Date(log.createdAt).toLocaleTimeString("en-US", {
                  hour12: false,
                })}
              </time>
              <span
                className={
                  log.level === "error" ? "text-red-400" : "text-white/50"
                }
              >
                {log.level}
              </span>
              <pre className="whitespace-pre-wrap break-words text-white/80">
                {log.message}
              </pre>
            </div>
          ))
        ) : (
          <p className="p-8 text-center text-white/50">
            No build logs were recorded.
          </p>
        )}
      </div>
    </main>
  );
}
