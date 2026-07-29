"use client";

import { Circle, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import type {
  RuntimeLogItem,
  RuntimeLogLevel,
} from "@/features/dashboard/types/runtime-log.types";

const LEVELS: RuntimeLogLevel[] = ["info", "warn", "error"];

export function ProjectLogsConsole({
  project,
  logs,
}: {
  project: string;
  logs: RuntimeLogItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeLevels, setActiveLevels] = useState<RuntimeLogLevel[]>(LEVELS);
  const [isRefreshing, startRefresh] = useTransition();
  const activeLevelSet = new Set(activeLevels);
  const filtered = logs.filter(
    (log) =>
      activeLevelSet.has(log.level) &&
      `${log.message} ${log.source} ${log.deploymentId}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const toggle = (level: RuntimeLogLevel) =>
    setActiveLevels((current) =>
      current.includes(level)
        ? current.filter((item) => item !== level)
        : [...current, level],
    );

  return (
    <div className="w-full space-y-6 px-5 py-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.15em] text-blue-400">
            Live control plane
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Logs
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {project} · latest 200 build and deployment events
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={() => startRefresh(() => router.refresh())}
        >
          <RefreshCcw
            className={isRefreshing ? "size-3.5 animate-spin" : "size-3.5"}
          />{" "}
          Refresh
        </Button>
      </header>
      <div className="flex flex-wrap items-center gap-2">
        <DashboardSearchInput
          containerClassName="min-w-[220px] flex-1"
          value={query}
          onValueChange={setQuery}
          placeholder="Search logs…"
        />
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            aria-pressed={activeLevels.includes(level)}
            onClick={() => toggle(level)}
            className="flex h-9 items-center gap-2 rounded-lg border border-[var(--hairline)] px-3 text-xs capitalize text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-white/[0.06] aria-pressed:text-foreground"
          >
            <Circle
              className={`size-2.5 ${level === "error" ? "fill-rose-400 text-rose-400" : level === "warn" ? "fill-amber-400 text-amber-400" : "fill-emerald-400 text-emerald-400"}`}
            />{" "}
            {level}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--hairline)]">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[9rem_5rem_7rem_10rem_minmax(18rem,1fr)] gap-3 border-b border-[var(--hairline)] px-4 py-3 font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span>Time</span>
            <span>Level</span>
            <span>Source</span>
            <span>Deployment</span>
            <span>Message</span>
          </div>
          {filtered.map((log) => (
            <div
              key={log.id}
              className="grid grid-cols-[9rem_5rem_7rem_10rem_minmax(18rem,1fr)] gap-3 border-b border-[var(--hairline)] px-4 py-3 font-geist-mono text-xs text-muted-foreground hover:bg-white/[0.025]"
            >
              <time>
                {new Date(log.timestamp).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZone: "UTC",
                })}
              </time>
              <span
                className={
                  log.level === "error"
                    ? "text-rose-400"
                    : log.level === "warn"
                      ? "text-amber-400"
                      : "text-emerald-400"
                }
              >
                {log.level}
              </span>
              <span>{log.source}</span>
              <span className="truncate">{log.deploymentId.slice(0, 12)}</span>
              <span className="text-foreground/80">{log.message}</span>
            </div>
          ))}
          {!filtered.length && (
            <p className="p-12 text-center text-sm text-muted-foreground">
              No real logs match these filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
