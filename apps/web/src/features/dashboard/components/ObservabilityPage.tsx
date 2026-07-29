import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";
import type { ObservabilityData } from "@/features/dashboard/types/observability.types";

const CHARTS = [
  {
    key: "requests",
    label: "Edge Requests",
    metric: "Invocations",
    value: (data: ObservabilityData) => data.requests.toLocaleString(),
  },
  {
    key: "latency",
    label: "Average Latency",
    metric: "Duration",
    value: (data: ObservabilityData) => `${data.averageLatency} ms`,
  },
  {
    key: "errors",
    label: "Runtime Errors",
    metric: "Error rate",
    value: (data: ObservabilityData) => `${data.errorRate.toFixed(2)}%`,
  },
  {
    key: "deployments",
    label: "Healthy Deployments",
    metric: "Active",
    value: (data: ObservabilityData) => data.activeDeployments.toLocaleString(),
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
        <button
          className="flex h-9 items-center gap-2 rounded-md border border-[var(--hairline)] bg-white/[0.015] px-3 text-xs text-foreground transition-colors hover:bg-white/[0.035]"
          type="button"
        >
          <CalendarDays className="size-3.5 text-muted-foreground" />
          Last 12 hours
          <ChevronDown className="ml-3 size-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex min-h-12 items-center gap-3 rounded-lg border border-[var(--hairline)] bg-white/[0.045] px-4 py-2.5 text-xs text-muted-foreground">
        <Sparkles className="size-4 shrink-0 text-foreground/80" />
        <p className="min-w-0 flex-1">
          Observability is in Beta. Live runtime signals will appear here as
          Multivrs metering is connected.
        </p>
        <span className="hidden rounded-md bg-foreground px-3 py-1.5 font-medium text-background sm:inline-flex">
          Beta
        </span>
      </div>

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
            <SignalChart active={data.state === "ready"} />
          </article>
        ))}
      </section>

      <label className="flex h-10 items-center gap-2 rounded-lg border border-[var(--hairline)] px-3 text-muted-foreground">
        <Search className="size-4" />
        <span className="sr-only">Search projects</span>
        <input
          className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
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

function SignalChart({ active }: { active: boolean }) {
  return (
    <div className="relative mt-4 h-32 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 grid grid-rows-3">
        <span className="border-b border-white/[0.045]" />
        <span className="border-b border-white/[0.045]" />
        <span className="border-b border-white/[0.045]" />
      </div>
      <svg
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
        viewBox="0 0 600 120"
      >
        <path
          d={
            active
              ? "M0 105 L35 104 L62 106 L94 102 L122 105 L150 104 L183 103 L212 104 L242 101 L270 104 L304 103 L332 104 L366 102 L394 104 L425 101 L455 104 L486 103 L518 105 L550 102 L600 104"
              : "M0 104 L600 104"
          }
          fill="none"
          stroke="rgb(59 130 246)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="absolute bottom-0 left-0 font-geist-mono text-[9px] text-muted-foreground/70">
        12h ago
      </span>
      <span className="absolute bottom-0 right-0 font-geist-mono text-[9px] text-muted-foreground/70">
        Just now
      </span>
    </div>
  );
}
