import { Check, LayoutGrid, type LucideIcon, Plus, Search } from "lucide-react";
import type { RefObject } from "react";
import type { ProjectOption } from "@/features/dashboard/components/ProjectScopeSwitcher";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import { cn } from "@/lib/utils";

interface ProjectScopeMenuProps {
  currentScope: string;
  inputRef: RefObject<HTMLInputElement | null>;
  isAllProjects: boolean;
  projects: ProjectOption[];
  query: string;
  onCreate(): void;
  onQueryChange(value: string): void;
  onSelect(scope: string): void;
}

export function ProjectScopeMenu({
  currentScope,
  inputRef,
  isAllProjects,
  projects,
  query,
  onCreate,
  onQueryChange,
  onSelect,
}: ProjectScopeMenuProps) {
  return (
    <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] overflow-hidden rounded-xl border border-[var(--hairline-strong)] bg-[var(--ink-raised)] shadow-2xl">
      <label className="flex items-center gap-2 border-b border-[var(--hairline)] px-3">
        <span className="sr-only">Find a project</span>
        <Search className="size-4 shrink-0 text-muted-foreground/70" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Find Project…"
          className="h-10 min-w-0 flex-1 bg-transparent text-[13px] text-foreground caret-[var(--accent)] outline-none placeholder:text-muted-foreground"
        />
      </label>
      <ul className="max-h-[280px] overflow-y-auto p-1">
        <ScopeRow
          label="All Projects"
          icon={LayoutGrid}
          selected={isAllProjects}
          onSelect={() => onSelect(ALL_PROJECTS_SCOPE)}
        />
        {projects.map((project) => (
          <ScopeRow
            key={project.slug}
            label={project.name}
            selected={currentScope === project.slug}
            onSelect={() => onSelect(project.slug)}
          />
        ))}
        {projects.length === 0 ? (
          <li className="px-3 py-2 text-[12px] text-muted-foreground/70">
            No projects found.
          </li>
        ) : null}
      </ul>
      <button
        type="button"
        onClick={onCreate}
        className="flex w-full items-center gap-2.5 border-t border-[var(--hairline)] px-3 py-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Plus className="size-4" strokeWidth={1.75} />
        Create Project
      </button>
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
  onSelect(): void;
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
        {selected ? <Check className="size-4 text-[var(--accent)]" /> : null}
      </button>
    </li>
  );
}
