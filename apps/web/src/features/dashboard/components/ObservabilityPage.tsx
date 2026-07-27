import { Activity, Box, Clock3, TriangleAlert } from "lucide-react";
import type { ObservabilityData } from "@/features/dashboard/types/observability.types";

export function ObservabilityPage({
  projectName,
  data,
}: {
  projectName: string;
  data: ObservabilityData;
}) {
  const metrics = [
    {
      icon: Activity,
      label: "Requests",
      value: data.requests.toLocaleString(),
    },
    {
      icon: Clock3,
      label: "Average latency",
      value: `${data.averageLatency} ms`,
    },
    {
      icon: TriangleAlert,
      label: "5xx error rate",
      value: `${data.errorRate.toFixed(2)}%`,
    },
    {
      icon: Box,
      label: "Healthy deployments",
      value: data.activeDeployments.toLocaleString(),
    },
  ];
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8">
      <header>
        <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-blue-400">
          Runtime health
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Observability
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Request and deployment health for {projectName}.
        </p>
      </header>
      {data.state !== "ready" && (
        <p className="border-y border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 text-xs text-amber-200">
          Cloudflare request telemetry is{" "}
          {data.state === "error"
            ? "temporarily unavailable"
            : "not configured"}
          . Deployment health remains live.
        </p>
      )}
      <section className="grid border-y border-[var(--hairline)] md:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="border-b border-[var(--hairline)] p-5 md:border-r md:border-b-0"
          >
            <metric.icon className="size-4 text-blue-400" />
            <p className="mt-5 text-3xl font-semibold tracking-tight">
              {metric.value}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{metric.label}</p>
          </article>
        ))}
      </section>
      <section className="overflow-hidden rounded-2xl border border-[var(--hairline)]">
        <div className="border-b border-[var(--hairline)] px-5 py-4">
          <h2 className="text-sm font-semibold">Recent runtime errors</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Build and runtime errors recorded by the control plane.
          </p>
        </div>
        {data.recentErrors.map((error) => (
          <div
            key={`${error.deploymentId}-${error.createdAt}`}
            className="grid gap-2 border-b border-[var(--hairline)] px-5 py-4 last:border-0 md:grid-cols-[10rem_1fr_auto]"
          >
            <span className="font-geist-mono text-xs text-blue-300">
              {error.deploymentId.slice(0, 12)}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {error.message}
            </span>
            <time className="font-geist-mono text-[10px] text-muted-foreground">
              {new Date(error.createdAt).toLocaleString()}
            </time>
          </div>
        ))}
        {!data.recentErrors.length && (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No runtime errors recorded.
          </p>
        )}
      </section>
      {data.errorDeployments > 0 && (
        <p className="text-xs text-amber-300">
          {data.errorDeployments} failed deployment
          {data.errorDeployments === 1 ? "" : "s"} remain in this project&apos;s
          history.
        </p>
      )}
    </div>
  );
}
