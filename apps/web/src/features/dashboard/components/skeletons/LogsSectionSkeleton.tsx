import { Circle, RefreshCcw, Search } from "lucide-react";
import { SKELETON_ROWS } from "./skeleton.constants";

export function LogsSectionSkeleton() {
  return (
    <main className="space-y-6 px-5 py-6" aria-busy>
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.15em] text-blue-400">
            Live control plane
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Logs
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Latest build and deployment events
          </p>
        </div>
        <button
          className="flex h-8 items-center gap-2 rounded-lg border border-[var(--hairline)] px-3 text-xs text-muted-foreground"
          disabled
          type="button"
        >
          <RefreshCcw className="size-3.5" /> Refresh
        </button>
      </header>
      <div className="flex gap-2">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-[var(--hairline)] bg-[var(--ink-raised)]/60 px-3 text-xs text-muted-foreground/70">
          <Search className="size-3.5" /> Search logs…
        </div>
        {["info", "warn", "error"].map((level) => (
          <button
            className="flex h-9 w-20 items-center justify-center gap-2 rounded-lg border border-[var(--hairline)] text-xs capitalize text-muted-foreground"
            disabled
            key={level}
            type="button"
          >
            <Circle className="size-2 fill-current" /> {level}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-white/8">
        <div className="grid h-10 grid-cols-[9rem_5rem_7rem_10rem_1fr] items-center gap-3 border-white/8 border-b px-4 font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <span>Time</span>
          <span>Level</span>
          <span>Source</span>
          <span>Deployment</span>
          <span>Message</span>
        </div>
        {SKELETON_ROWS.map((row) => (
          <div
            className="h-11 animate-pulse border-white/6 border-b bg-white/[0.025]"
            key={row}
          />
        ))}
      </div>
    </main>
  );
}
