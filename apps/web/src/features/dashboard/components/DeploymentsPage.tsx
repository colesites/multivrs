"use client";

import { Calendar, ChevronDown, Circle, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeploymentRow } from "./DeploymentRow";

export interface DashboardDeployment {
  id: string;
  projectId: string;
  project: string;
  status: string;
  branch: string;
  duration: string;
  url: string;
  createdAt: string;
  commitMessage?: string;
  environment?: "Production" | "Preview";
  commitSha?: string;
  detailsUrl: string;
  errorMessage?: string | null;
}

interface DeploymentsPageProps {
  deployments: DashboardDeployment[];
}

export function DeploymentsPage({ deployments }: DeploymentsPageProps) {
  return (
    <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both w-full px-5 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground tracking-tight">
          Deployments
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 h-8 text-[12px] bg-background"
        >
          <ListFilter className="h-3.5 w-3.5 opacity-70" /> Filter
        </Button>
      </div>

      {/* Advanced Filter Bar (Vercel-like) */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="h-9 px-3 gap-2 bg-background border-[var(--hairline)] text-muted-foreground hover:text-foreground"
        >
          <Calendar className="h-4 w-4 opacity-70" />
          <span className="text-[12px] font-medium">Select Date Range</span>
        </Button>
        <Button
          variant="outline"
          className="h-9 px-3 gap-2 bg-background border-[var(--hairline)] text-muted-foreground hover:text-foreground"
        >
          <span className="text-[12px] font-medium w-[120px] text-left">
            All Authors...
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        <Button
          variant="outline"
          className="h-9 px-3 gap-2 bg-background border-[var(--hairline)] text-muted-foreground hover:text-foreground"
        >
          <span className="text-[12px] font-medium w-[120px] text-left">
            All Environments
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        <Button
          variant="outline"
          className="h-9 px-3 gap-2 bg-background border-[var(--hairline)] text-muted-foreground hover:text-foreground"
        >
          <span className="text-[12px] font-medium w-[120px] text-left">
            All Repositories
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        <Button
          variant="outline"
          className="h-9 px-3 gap-2 bg-background border-[var(--hairline)] text-muted-foreground hover:text-foreground"
        >
          <span className="text-[12px] font-medium w-[120px] text-left">
            All Branches...
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        <Button
          variant="outline"
          className="h-9 px-3 gap-2 bg-background border-[var(--hairline)] text-muted-foreground hover:text-foreground ml-auto"
        >
          <div className="flex gap-1 items-center">
            <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
            <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
            <Circle className="h-2 w-2 fill-rose-500 text-rose-500" />
          </div>
          <span className="text-[12px] font-medium">Status</span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-sm">
            6/7
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </div>

      {/* Deployments Table Container */}
      <div className="rounded-[12px] border border-[var(--hairline)] bg-background relative overflow-hidden card-grain shadow-sm">
        {/* Table Feed */}
        <div className="flex flex-col relative z-10">
          {deployments.length > 0 ? (
            deployments.map((dep) => (
              <DeploymentRow key={dep.id} deployment={dep} />
            ))
          ) : (
            <div className="px-6 py-12 text-center text-[13px] text-muted-foreground">
              No deployments match the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* Load More Footer */}
      {deployments.length > 0 && (
        <div className="w-full flex justify-center pt-2">
          <Button
            variant="ghost"
            className="text-[12px] text-muted-foreground hover:text-foreground font-semibold px-6 h-10 w-full border border-[var(--hairline)] bg-background card-grain hover:bg-white/[0.03]"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
