"use client";

import {
  Check,
  ChevronsUpDown,
  LayoutGrid,
  type LucideIcon,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_PROJECTS_SCOPE,
  buildNavHref,
} from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { cn } from "@/lib/utils";

export interface ProjectOption {
  slug: string;
  name: string;
}

interface ProjectScopeSwitcherProps {
  projects?: ProjectOption[];
}

/**
 * The "All Projects" header switcher (Vercel's `~`). Opens a searchable list to
 * jump the whole nav between all-projects and a single project, preserving the
 * active section.
 */
export function ProjectScopeSwitcher({
  projects = [],
}: ProjectScopeSwitcherProps) {
  const router = useRouter();
  const { username, scope, activeSlug, isAllProjects } = useDashboardScope();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? projects.filter((p) => p.name.toLowerCase().includes(q))
      : projects;
  }, [projects, query]);

  const select = (nextScope: string) => {
    setOpen(false);
    setQuery("");
    router.push(buildNavHref(username, nextScope, activeSlug));
  };

  const label = isAllProjects ? "All Projects" : scope;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-2 rounded-lg border border-[var(--hairline)] bg-white/[0.02] px-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-[var(--hairline-strong)] hover:bg-white/[0.04]"
      >
        <span className="max-w-[180px] truncate">{label}</span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground/70" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] overflow-hidden rounded-xl border border-[var(--hairline-strong)] bg-[var(--ink-raised)] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-3">
            <Search className="size-4 shrink-0 text-muted-foreground/70" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find Project…"
              className="h-10 min-w-0 flex-1 bg-transparent text-[13px] text-foreground caret-[var(--accent)] outline-none placeholder:text-muted-foreground"
            />
          </div>

          <ul className="max-h-[280px] overflow-y-auto p-1">
            <ScopeRow
              label="All Projects"
              icon={LayoutGrid}
              selected={isAllProjects}
              onSelect={() => select(ALL_PROJECTS_SCOPE)}
            />
            {filtered.map((p) => (
              <ScopeRow
                key={p.slug}
                label={p.name}
                selected={scope === p.slug}
                onSelect={() => select(p.slug)}
              />
            ))}
            {projects.length === 0 && (
              <li className="px-3 py-2 text-[12px] text-muted-foreground/70">
                No projects yet.
              </li>
            )}
          </ul>

          <button
            type="button"
            onClick={() => select(ALL_PROJECTS_SCOPE)}
            className="flex w-full items-center gap-2.5 border-t border-[var(--hairline)] px-3 py-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="size-4" strokeWidth={1.75} />
            Create Project
          </button>
        </div>
      )}
    </div>
  );
}

function ScopeRow({
  label,
  icon: Icon,
  selected,
  onSelect,
}: {
  label: string;
  icon?: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.05]",
          selected ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded border border-[var(--hairline)] font-geist-mono text-[11px]">
          {Icon ? (
            <Icon className="size-3" strokeWidth={1.75} />
          ) : (
            label[0]?.toUpperCase()
          )}
        </span>
        <span className="flex-1 truncate">{label}</span>
        {selected && <Check className="size-4 text-[var(--accent)]" />}
      </button>
    </li>
  );
}
