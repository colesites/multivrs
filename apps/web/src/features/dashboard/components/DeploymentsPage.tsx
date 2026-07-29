"use client";

import { Suspense, use, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardSearchInput } from "@/features/dashboard/components/DashboardSearchInput";
import { DeploymentRow } from "@/features/dashboard/components/DeploymentRow";
import { DeploymentsTableSkeleton } from "@/features/dashboard/components/skeletons/DataSectionSkeletons";

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
  deployments: Promise<DashboardDeployment[] | null>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  return (
    <div className="w-full space-y-6 px-5 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Deployments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build history and promotion status across this scope.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <DashboardSearchInput
          containerClassName="min-w-64 flex-1"
          value={query}
          onValueChange={setQuery}
          placeholder="Search project, branch, or commit"
        />
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
      <Suspense fallback={<DeploymentsTableSkeleton />}>
        <DeploymentsTable
          deployments={deployments}
          query={query}
          status={status}
        />
      </Suspense>
    </div>
  );
}

function DeploymentsTable({
  deployments: deploymentsPromise,
  query,
  status,
}: {
  deployments: Promise<DashboardDeployment[] | null>;
  query: string;
  status: string;
}) {
  const deployments = use(deploymentsPromise) ?? [];
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
  );
}
