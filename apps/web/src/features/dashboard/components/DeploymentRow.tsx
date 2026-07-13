"use client";

import { GitBranch, GitCommitHorizontal, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeploymentActions } from "./DeploymentActions";
import type { DashboardDeployment } from "./DeploymentsPage";

interface DeploymentRowProps {
  deployment: DashboardDeployment;
}

export function DeploymentRow({ deployment }: DeploymentRowProps) {
  const isBuilding = deployment.status === "Building";
  const isReady = deployment.status === "Ready";
  const isError = deployment.status === "Failed";

  const timeAgo = formatRelative(new Date(deployment.createdAt));

  const envColor =
    deployment.environment === "Production"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-purple-500/10 text-purple-400 border-purple-500/20";

  return (
    <div className="group relative flex items-center justify-between gap-4 border-b border-[var(--hairline)] px-4 py-3 text-[13px] transition-colors hover:bg-white/[0.02]">
      {/* 1. Commit Message (Flexes to fill) */}
      <div className="flex flex-1 items-center gap-3 min-w-0 pr-4">
        {/* Status Dot */}
        <div className="relative flex shrink-0 items-center justify-center h-2 w-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isReady && "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
              isBuilding &&
                "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse",
              isError && "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
            )}
          />
        </div>

        <span className="truncate font-medium text-foreground/90">
          {deployment.commitMessage || "Manual Deployment"}
        </span>
      </div>

      {/* 2. Metadata Columns (Fixed widths or shrinkable) */}
      <div className="flex shrink-0 items-center gap-6 text-muted-foreground/80 font-mono text-[12px]">
        {/* Status + Duration */}
        <div className="flex items-center gap-2 w-28">
          <span
            className={cn(
              "font-bold font-sans text-[11px] uppercase tracking-wider",
              isReady && "text-emerald-400",
              isBuilding && "text-amber-400",
              isError && "text-rose-400",
            )}
          >
            {deployment.status}
          </span>
          <span className="text-muted-foreground/50">
            {deployment.duration}
          </span>
        </div>

        {/* Environment Badge */}
        <div className="w-24">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
              envColor,
            )}
          >
            {deployment.environment || "Preview"}
          </span>
        </div>

        {/* Project / Repo */}
        <div className="flex items-center gap-1.5 w-32 truncate">
          <PlayCircle className="h-3.5 w-3.5 text-blue-400/70 shrink-0" />
          <span className="truncate">{deployment.project}</span>
        </div>

        {/* Commit SHA */}
        <div className="flex items-center gap-1.5 w-24">
          <GitCommitHorizontal className="h-3.5 w-3.5 shrink-0" />
          <span>{deployment.commitSha || "N/A"}</span>
        </div>

        {/* Branch */}
        <div className="flex items-center gap-1.5 w-28 truncate">
          <GitBranch className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{deployment.branch}</span>
        </div>

        {/* Time Ago */}
        <div className="w-20 text-right">{timeAgo}</div>

        {/* Action Menu */}
        <div className="w-8 flex justify-end">
          <DeploymentActions deployment={deployment} />
        </div>
      </div>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}
