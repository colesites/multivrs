"use client";

import { BarChart3, Grid2X2, LayoutGrid, List, ListFilter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { cn } from "@/lib/utils";

export type ProjectLayout = "grid" | "list";
export type ProjectFilter = "all" | "building" | "error" | "ready";
export type ProjectSort = "activity" | "name";
export type ProjectView = "projects" | "usage";

interface ProjectsToolbarProps {
  layout: ProjectLayout;
  filter: ProjectFilter;
  onFilterChange: (filter: ProjectFilter) => void;
  onLayoutChange: (layout: ProjectLayout) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: ProjectSort) => void;
  onViewChange: (view: ProjectView) => void;
  query: string;
  sort: ProjectSort;
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
          <DashboardSearchInput
            containerClassName="min-w-64 flex-1"
            value={props.query}
            onValueChange={props.onQueryChange}
            placeholder="Search projects"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label="Filter and sort projects"
                className={cn(
                  "relative border-[var(--hairline)] bg-black/20",
                  props.filter !== "all" &&
                    "border-foreground/30 text-foreground",
                )}
              >
                <ListFilter className="size-4" />
                {props.filter !== "all" ? (
                  <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={props.filter}
                onValueChange={(value) =>
                  props.onFilterChange(toProjectFilter(value))
                }
              >
                <DropdownMenuRadioItem value="all">
                  All projects
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="ready">
                  Ready
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="building">
                  Building
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="error">
                  Error
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={props.sort}
                onValueChange={(value) =>
                  props.onSortChange(toProjectSort(value))
                }
              >
                <DropdownMenuRadioItem value="activity">
                  Activity
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex rounded-lg border border-[var(--hairline)] bg-black/20 p-1">
            <button
              type="button"
              onClick={() => props.onLayoutChange("grid")}
              aria-label="Grid view"
              aria-pressed={props.layout === "grid"}
              className={
                props.layout === "grid"
                  ? "flex size-7 items-center justify-center rounded-md bg-white/10"
                  : "flex size-7 items-center justify-center rounded-md text-muted-foreground"
              }
            >
              <Grid2X2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => props.onLayoutChange("list")}
              aria-label="List view"
              aria-pressed={props.layout === "list"}
              className={
                props.layout === "list"
                  ? "flex size-7 items-center justify-center rounded-md bg-white/10"
                  : "flex size-7 items-center justify-center rounded-md text-muted-foreground"
              }
            >
              <List className="size-4" />
            </button>
          </div>
          <Link href="/new" className={buttonVariants({ size: "lg" })}>
            Add New
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function toProjectFilter(value: string): ProjectFilter {
  return value === "ready" || value === "building" || value === "error"
    ? value
    : "all";
}

function toProjectSort(value: string): ProjectSort {
  return value === "name" ? "name" : "activity";
}
