import { Bot, ChevronDown, Search } from "lucide-react";
import SpecularButton from "@/components/SpecularButton";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DomainProjectOption } from "@/lib/services/domain.service";

interface AssignDomainTargetStepProps {
  fullDomain: string;
  pending: boolean;
  projectId: string;
  projectSearch: string;
  projects: DomainProjectOption[];
  selectedProject?: DomainProjectOption;
  dropdownOpen: boolean;
  onBack(): void;
  onDropdownChange(open: boolean): void;
  onProjectChange(projectId: string): void;
  onSearchChange(value: string): void;
  onSubmit(): void;
}

export function AssignDomainTargetStep({
  fullDomain,
  pending,
  projectId,
  projectSearch,
  projects,
  selectedProject,
  dropdownOpen,
  onBack,
  onDropdownChange,
  onProjectChange,
  onSearchChange,
  onSubmit,
}: AssignDomainTargetStepProps) {
  const filtered = projects.filter((project) =>
    project.name.toLowerCase().includes(projectSearch.toLowerCase()),
  );
  return (
    <>
      <DialogHeader className="space-y-1.5 text-left">
        <DialogTitle className="text-lg font-semibold text-white">
          Connect Domain
        </DialogTitle>
        <DialogDescription className="text-xs text-white/50">
          Connect{" "}
          <span className="font-medium text-white/80">{fullDomain}</span> to a
          project.
        </DialogDescription>
      </DialogHeader>
      <div className="relative my-4 space-y-2">
        <span className="block text-xs font-medium text-white/80">Project</span>
        <button
          type="button"
          onClick={() => onDropdownChange(!dropdownOpen)}
          className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-black/60 px-3 text-sm text-white focus:border-white/40"
        >
          <span className="flex items-center gap-2.5">
            <Bot className="size-4 text-white/60" />
            {selectedProject?.name ?? "Select Project..."}
          </span>
          <ChevronDown className="size-4 text-white/40" />
        </button>
        {dropdownOpen ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 divide-y divide-white/5 rounded-xl border border-white/10 bg-[#09090b] p-2 shadow-2xl">
            <label className="relative mb-2 block">
              <span className="sr-only">Find a project</span>
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/40" />
              <input
                value={projectSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Select Project..."
                className="h-8 w-full rounded-md border border-white/10 bg-black/80 pl-8 pr-3 text-xs text-white outline-none focus:border-white/40"
              />
            </label>
            <div className="max-h-48 space-y-0.5 overflow-y-auto pt-1">
              {filtered.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onProjectChange(project.id)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    project.id === projectId
                      ? "bg-white/15 font-medium text-white"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Bot className="size-3.5 shrink-0 text-white/60" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <DialogFooter className="flex items-center justify-between pt-2 sm:justify-between">
        <SpecularButton
          size="sm"
          tint="#ffffff"
          tintOpacity={0.05}
          lineColor="#666666"
          baseColor="#333333"
          textColor="#cccccc"
          onClick={onBack}
        >
          Back
        </SpecularButton>
        <SpecularButton
          size="sm"
          tint="#ffffff"
          tintOpacity={0.9}
          lineColor="#ffffff"
          baseColor="#ffffff"
          textColor="#000000"
          disabled={!projectId || pending}
          onClick={onSubmit}
        >
          {pending ? "Connecting..." : "Connect"}
        </SpecularButton>
      </DialogFooter>
    </>
  );
}
