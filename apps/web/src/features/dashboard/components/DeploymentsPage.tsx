"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeploymentRow } from "@/features/dashboard/components/DeploymentRow";

export interface DashboardDeployment {
  branch: string;
  commitMessage?: string;
  commitSha?: string;
  createdAt: string;
  detailsUrl: string;
  duration: string;
  environment?: "Preview" | "Production";
  errorMessage?: string | null;
  id: string;
  project: string;
  projectId: string;
  status: string;
  url: string;
}

export function DeploymentsPage({
  deployments,
}: {
  deployments: DashboardDeployment[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const normalized = query.trim().toLowerCase();
  const filtered = deployments.filter(
    (deployment) =>
      (status === "all" || deployment.status === status) &&
      (!normalized ||
        [
          deployment.project,
          deployment.branch,
          deployment.commitSha,
          deployment.commitMessage,
        ].some((value) => value?.toLowerCase().includes(normalized))),
  );
  return (
    <div className="w-full space-y-6 px-5 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Deployments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build history and promotion status across this scope.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <label className="flex h-9 min-w-64 flex-1 items-center gap-2 border border-[var(--hairline)] bg-background px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search project, branch, or commit"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          />
        </label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Ready">Ready</SelectItem>
            <SelectItem value="Building">Building</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-background">
        {filtered.map((deployment) => (
          <DeploymentRow key={deployment.id} deployment={deployment} />
        ))}
        {!filtered.length ? (
          <div className="px-6 py-14 text-center text-sm text-muted-foreground">
            No deployments match these filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
