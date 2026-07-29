import { CalendarDays, ChevronDown, Search, Sparkles } from "lucide-react";

const CHART_KEYS = ["edge", "latency", "errors", "deployments"];
const ROW_KEYS = ["project-one", "project-two", "project-three"];

export function ObservabilitySectionSkeleton() {
  return (
    <main className="w-full space-y-3 px-4 py-4 lg:px-5" aria-busy>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex h-9 min-w-36 items-center justify-between gap-4 rounded-md border border-[var(--hairline)] bg-white/[0.015] px-3 text-xs text-foreground">
          Production
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </div>
        <div className="flex h-9 items-center gap-2 rounded-md border border-[var(--hairline)] bg-white/[0.015] px-3 text-xs text-foreground">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          Last 12 hours
          <ChevronDown className="ml-3 size-3.5 text-muted-foreground" />
        </div>
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

      <section className="grid gap-3 xl:grid-cols-2">
        {CHART_KEYS.map((key) => (
          <div
            className="min-h-60 animate-pulse rounded-xl border border-[var(--hairline)] bg-white/[0.012] p-4"
            key={key}
          >
            <div className="h-3 w-32 rounded-sm bg-white/[0.075]" />
            <div className="mt-4 h-2.5 w-20 rounded-sm bg-white/[0.04]" />
            <div className="mt-2 h-4 w-16 rounded-sm bg-white/[0.07]" />
            <div className="mt-6 h-24 rounded-sm bg-white/[0.025]" />
          </div>
        ))}
      </section>

      <div className="flex h-10 items-center gap-2 rounded-lg border border-[var(--hairline)] px-3 text-muted-foreground">
        <Search className="size-4" />
        <span className="text-xs">Search</span>
      </div>

      <section className="overflow-hidden rounded-lg border border-[var(--hairline)]">
        <div className="grid grid-cols-[minmax(0,1fr)_8rem] border-b border-[var(--hairline)] px-4 py-3 text-xs text-muted-foreground">
          <span>Project</span>
          <span>Requests</span>
        </div>
        <div className="animate-pulse">
          {ROW_KEYS.map((key) => (
            <div
              className="grid min-h-12 grid-cols-[minmax(0,1fr)_8rem] items-center border-b border-[var(--hairline)] px-4 last:border-b-0"
              key={key}
            >
              <div className="h-3 w-36 rounded-sm bg-white/[0.055]" />
              <div className="h-3 w-12 rounded-sm bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
