import { Bot, ChevronDown } from "lucide-react";
import SpecularButton from "@/components/SpecularButton";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
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
      <div className="my-4 space-y-2">
        <span className="block text-xs font-medium text-white/80">Project</span>
        <DropdownMenu open={dropdownOpen} onOpenChange={onDropdownChange}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-black/60 px-3 text-sm text-white focus:border-white/40"
            >
              <span className="flex items-center gap-2.5">
                <Bot className="size-4 text-white/60" />
                {selectedProject?.name ?? "Select Project..."}
              </span>
              <ChevronDown className="size-4 text-white/40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) rounded-xl border-white/10 bg-[#09090b] p-2 shadow-2xl"
          >
            <DashboardSearchInput
              containerClassName="mb-2 w-full"
              value={projectSearch}
              onValueChange={onSearchChange}
              placeholder="Select Project..."
              size="sm"
              onKeyDown={(event) => event.stopPropagation()}
            />
            <div className="max-h-48 space-y-0.5 overflow-y-auto pt-1">
              {filtered.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={() => onProjectChange(project.id)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    project.id === projectId
                      ? "bg-white/15 font-medium text-white"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Bot className="size-3.5 shrink-0 text-white/60" />
                  <span className="truncate">{project.name}</span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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
