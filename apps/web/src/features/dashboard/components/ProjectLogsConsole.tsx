"use client";

import {
  Calendar,
  ChevronDown,
  Circle,
  ListFilter,
  Pause,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type LogLevel,
  MOCK_RUNTIME_LOGS,
} from "@/features/dashboard/constants/mock-logs";

const LEVELS: LogLevel[] = ["info", "warn", "error"];

export function ProjectLogsConsole({ project }: { project: string }) {
  const [query, setQuery] = useState("");
  const [activeLevels, setActiveLevels] = useState<LogLevel[]>(LEVELS);
  const logs = useMemo(
    () =>
      MOCK_RUNTIME_LOGS.filter(
        (log) =>
          activeLevels.includes(log.level) &&
          `${log.path} ${log.message} ${log.host}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [activeLevels, query],
  );
  const toggle = (level: LogLevel) =>
    setActiveLevels((levels) =>
      levels.includes(level)
        ? levels.filter((item) => item !== level)
        : [...levels, level],
    );

  return (
    <div className="w-full space-y-6 px-5 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Logs
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {project} · Runtime events
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-[12px]">
          <ListFilter className="size-3.5" /> Filter
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[var(--hairline)] bg-background px-3">
          <Search className="size-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search logs…"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Button variant="outline" className="h-9 gap-2 text-[12px]">
          <Calendar className="size-3.5" /> Last 30 minutes
        </Button>
        <Button variant="outline" className="h-9 gap-2 text-[12px]">
          <span>Production</span>
          <ChevronDown className="size-3.5" />
        </Button>
        <Button variant="outline" className="h-9 gap-2 text-[12px]">
          <span>All routes</span>
          <ChevronDown className="size-3.5" />
        </Button>
        <div className="ml-auto flex h-9 items-center gap-1 rounded-lg border border-[var(--hairline)] bg-background p-1">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              aria-pressed={activeLevels.includes(level)}
              onClick={() => toggle(level)}
              className={`flex size-7 items-center justify-center rounded-md transition-colors ${activeLevels.includes(level) ? "bg-white/8" : "opacity-35"}`}
            >
              <Circle
                className={`size-2.5 ${level === "error" ? "fill-rose-400 text-rose-400" : level === "warn" ? "fill-amber-400 text-amber-400" : "fill-emerald-400 text-emerald-400"}`}
              />
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px]"
          >
            <Pause className="size-3" /> Live
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-[12px] border border-[var(--hairline)] bg-background">
        <div className="min-w-[840px]">
          <div className="grid grid-cols-[8rem_4.5rem_4rem_11rem_9rem_minmax(16rem,1fr)] gap-3 border-b border-[var(--hairline)] px-4 py-3 font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span>Time</span>
            <span>Method</span>
            <span>Status</span>
            <span>Host</span>
            <span>Request</span>
            <span>Message</span>
          </div>
          {logs.map((log) => (
            <div
              key={log.id}
              className="grid grid-cols-[8rem_4.5rem_4rem_11rem_9rem_minmax(16rem,1fr)] gap-3 border-b border-[var(--hairline)] px-4 py-3 font-geist-mono text-xs text-muted-foreground transition-colors hover:bg-white/[0.025]"
            >
              <span>{log.timestamp}</span>
              <span className="text-foreground/85">{log.method}</span>
              <span
                className={
                  log.status >= 500
                    ? "text-rose-400"
                    : log.status >= 400
                      ? "text-amber-400"
                      : "text-emerald-400"
                }
              >
                {log.status}
              </span>
              <span className="truncate">{log.host}</span>
              <span className="text-foreground/85">{log.path}</span>
              <span
                className={log.level === "error" ? "text-rose-300" : "truncate"}
              >
                {log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="p-12 text-center text-sm text-muted-foreground">
              No logs match the selected filters.
            </p>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        className="h-10 w-full border border-[var(--hairline)] text-[12px] font-semibold text-muted-foreground hover:text-foreground"
      >
        Load more logs
      </Button>
    </div>
  );
}
