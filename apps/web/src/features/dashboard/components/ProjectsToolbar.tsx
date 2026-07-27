"use client";

import { BarChart3, Grid2X2, LayoutGrid, List, Search } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProjectLayout = "grid" | "list";
export type ProjectStatusFilter = "all" | "building" | "error" | "ready";
export type ProjectView = "projects" | "usage";

interface ProjectsToolbarProps {
  layout: ProjectLayout;
  onLayoutChange: (layout: ProjectLayout) => void;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: ProjectStatusFilter) => void;
  onViewChange: (view: ProjectView) => void;
  query: string;
  status: ProjectStatusFilter;
  view: ProjectView;
}

export function ProjectsToolbar(props: ProjectsToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-sm font-semibold">
          {props.view === "projects" ? "All Projects" : "Usage"}
        </h1>
        <div className="flex rounded-lg border border-[var(--hairline)] bg-black/20 p-1 text-xs">
          <button
            type="button"
            onClick={() => props.onViewChange("projects")}
            className={
              props.view === "projects"
                ? "flex h-7 items-center gap-1.5 rounded-md bg-white/10 px-2.5"
                : "flex h-7 items-center gap-1.5 px-2.5 text-muted-foreground"
            }
          >
            <LayoutGrid className="size-3.5" /> Projects
          </button>
          <button
            type="button"
            onClick={() => props.onViewChange("usage")}
            className={
              props.view === "usage"
                ? "flex h-7 items-center gap-1.5 rounded-md bg-white/10 px-2.5"
                : "flex h-7 items-center gap-1.5 px-2.5 text-muted-foreground"
            }
          >
            <BarChart3 className="size-3.5" /> Usage
          </button>
        </div>
      </div>
      {props.view === "projects" ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-9 min-w-64 flex-1 items-center gap-2 rounded-lg border border-[var(--hairline)] bg-[var(--ink-raised)]/60 px-3">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              value={props.query}
              onChange={(event) => props.onQueryChange(event.target.value)}
              placeholder="Search projects"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
            />
          </label>
          <Select
            value={props.status}
            onValueChange={(value) =>
              props.onStatusChange(
                value === "ready" || value === "building" || value === "error"
                  ? value
                  : "all",
              )
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="building">Building</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex h-9 rounded-lg border border-[var(--hairline)]">
            <button
              type="button"
              onClick={() => props.onLayoutChange("list")}
              aria-label="List view"
              className={
                props.layout === "list"
                  ? "bg-white/10 px-2.5"
                  : "px-2.5 text-muted-foreground"
              }
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => props.onLayoutChange("grid")}
              aria-label="Grid view"
              className={
                props.layout === "grid"
                  ? "bg-white/10 px-2.5"
                  : "px-2.5 text-muted-foreground"
              }
            >
              <Grid2X2 className="size-4" />
            </button>
          </div>
          <Link
            href="/new"
            className="inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-[13px] font-semibold text-background"
          >
            Add new
          </Link>
        </div>
      ) : null}
    </div>
  );
}
