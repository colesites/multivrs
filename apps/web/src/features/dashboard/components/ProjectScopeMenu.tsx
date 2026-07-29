import { Check, LayoutGrid, type LucideIcon, Plus } from "lucide-react";
import type { RefObject } from "react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
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
    <DropdownMenuContent
      align="start"
      className="w-[300px] rounded-xl border border-[var(--hairline-strong)] bg-[var(--ink-raised)] p-0 shadow-2xl"
    >
      <DashboardSearchInput
        ref={inputRef}
        containerClassName="h-10 rounded-none border-x-0 border-t-0 bg-transparent"
        value={query}
        onValueChange={onQueryChange}
        placeholder="Find Project…"
        onKeyDown={(event) => event.stopPropagation()}
      />
      <div className="max-h-[280px] overflow-y-auto p-1">
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
          <p className="px-3 py-2 text-[12px] text-muted-foreground/70">
            No projects found.
          </p>
        ) : null}
      </div>
      <DropdownMenuSeparator className="m-0" />
      <DropdownMenuItem
        onSelect={onCreate}
        className="rounded-none px-3 py-2.5 text-[13px] text-muted-foreground"
      >
        <Plus className="size-4" strokeWidth={1.75} />
        Create Project
      </DropdownMenuItem>
    </DropdownMenuContent>
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
    <DropdownMenuItem
      onSelect={onSelect}
      className={cn(
        "rounded-lg px-2.5 py-2 text-[13px]",
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
    </DropdownMenuItem>
  );
}
