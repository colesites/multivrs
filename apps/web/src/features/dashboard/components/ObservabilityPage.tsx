import { CalendarDays, ChevronDown, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { ObservabilitySignalChart } from "@/features/dashboard/components/ObservabilitySignalChart";
import type { ObservabilityData } from "@/features/dashboard/types/observability.types";

const CHARTS = [
  {
    key: "requests",
    label: "Edge Requests",
    metric: "Invocations",
    signal: "requests",
    value: (data: ObservabilityData) => data.requests.toLocaleString(),
  },
  {
    key: "transfer",
    label: "Fast Data Transfer",
    metric: "Bytes served",
    signal: "bandwidthBytes",
    value: (data: ObservabilityData) => formatBytes(data.bandwidthBytes),
  },
  {
    key: "latency",
    label: "Average Latency",
    metric: "Duration",
    signal: "latency",
    value: (data: ObservabilityData) => `${data.averageLatency} ms`,
  },
  {
    key: "errors",
    label: "Runtime Errors",
    metric: "HTTP 5xx responses",
    signal: "errors",
    value: (data: ObservabilityData) => `${data.errorRate.toFixed(2)}%`,
  },
] as const;

export function ObservabilityPage({
  projectName,
  data,
}: {
  projectName: string;
  data: ObservabilityData;
}) {
  return (
    <main className="w-full space-y-3 px-4 py-4 lg:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="flex h-9 min-w-36 items-center justify-between gap-4 rounded-md border border-[var(--hairline)] bg-white/[0.015] px-3 text-xs text-foreground transition-colors hover:bg-white/[0.035]"
          type="button"
        >
          Production
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
        <nav className="flex h-9 items-center gap-3 border-b border-[var(--hairline)] px-1 text-xs">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          {(["24h", "7d", "30d"] as const).map((range) => (
            <Link
              className={
                range === data.range
                  ? "text-foreground"
                  : "text-muted-foreground"
              }
              href={`?range=${range}`}
              key={range}
              scroll={false}
            >
              {range.toUpperCase()}
            </Link>
          ))}
        </nav>
      </div>

      <p className="border-y border-[var(--hairline)] px-1 py-3 text-xs text-muted-foreground">
        Live serving-edge signals for requests, transfer, latency, and HTTP
        errors.
      </p>

      {data.state !== "ready" ? (
        <p className="border-y border-amber-400/20 bg-amber-400/[0.035] px-4 py-2.5 text-xs text-amber-200">
          Live request telemetry is currently unavailable. Deployment health
          remains available.
        </p>
      ) : null}

      <section className="grid gap-3 xl:grid-cols-2">
        {CHARTS.map((chart) => (
          <article
            className="min-h-60 rounded-xl border border-[var(--hairline)] bg-white/[0.012] p-4"
            key={chart.key}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[13px] font-medium text-foreground">
                  {chart.label}
                </h2>
                <p className="mt-3 text-xs text-muted-foreground">
                  {chart.metric}
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {chart.value(data)}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
            <ObservabilitySignalChart
              data={data.series}
              signal={chart.signal}
            />
          </article>
        ))}
      </section>

      <label className="flex h-10 items-center gap-2 rounded-lg border border-[var(--hairline)] px-3 text-muted-foreground">
        <Search className="size-4" />
        <span className="sr-only">Search projects</span>
        <input
          className="w-full bg-transparent text-xs text-foreground outline-hidden placeholder:text-muted-foreground"
          placeholder="Search"
          type="search"
        />
      </label>

      <section className="overflow-hidden rounded-lg border border-[var(--hairline)]">
        <div className="grid grid-cols-[minmax(0,1fr)_8rem] border-b border-[var(--hairline)] px-4 py-3 text-xs text-muted-foreground">
          <span>Project</span>
          <span>Requests</span>
        </div>
        <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_8rem] items-center px-4 text-xs">
          <span className="flex min-w-0 items-center gap-2.5 text-muted-foreground">
            <span className="size-2 shrink-0 rounded-full bg-blue-400" />
            <span className="truncate">{projectName}</span>
          </span>
          <span className="flex items-center justify-between font-geist-mono text-muted-foreground">
            {data.requests.toLocaleString()}
            <ChevronRight className="size-3.5" />
          </span>
        </div>
      </section>

      {data.recentErrors.length > 0 ? (
        <section className="overflow-hidden rounded-lg border border-[var(--hairline)]">
          <div className="border-b border-[var(--hairline)] px-4 py-3">
            <h2 className="text-xs font-medium">Recent runtime errors</h2>
          </div>
          {data.recentErrors.map((error) => (
            <div
              className="grid gap-2 border-b border-[var(--hairline)] px-4 py-3 text-xs last:border-b-0 md:grid-cols-[9rem_1fr_auto]"
              key={`${error.deploymentId}-${error.createdAt}`}
            >
              <span className="truncate font-geist-mono text-blue-300">
                {error.deploymentId.slice(0, 12)}
              </span>
              <span className="truncate text-muted-foreground">
                {error.message}
              </span>
              <time className="font-geist-mono text-[10px] text-muted-foreground">
                {new Date(error.createdAt).toLocaleString()}
              </time>
            </div>
          ))}
        </section>
      ) : null}
    </main>
  );
}

function formatBytes(value: number): string {
  if (value < 1_024) return `${Math.round(value)} B`;
  if (value < 1_048_576) return `${(value / 1_024).toFixed(1)} KB`;
  if (value < 1_073_741_824) return `${(value / 1_048_576).toFixed(1)} MB`;
  return `${(value / 1_073_741_824).toFixed(2)} GB`;
}
