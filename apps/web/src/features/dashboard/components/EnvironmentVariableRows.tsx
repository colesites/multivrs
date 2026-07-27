"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardEnvironmentVariable } from "@/features/dashboard/types/environment-variable.types";
import { requestOk } from "@/lib/api/request.client";

export function EnvironmentVariableRows({
  projectId,
  variables,
}: {
  projectId: string;
  variables: DashboardEnvironmentVariable[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string>();
  const [error, setError] = useState<string>();
  function remove(variable: DashboardEnvironmentVariable) {
    if (pendingId) return;
    setPendingId(variable.id);
    setError(undefined);
    void requestOk(
      `/api/projects/${projectId}/environment/${variable.id}`,
      { method: "DELETE" },
      "Delete failed",
    )
      .then(() => router.refresh())
      .catch(() => setError(`Could not delete ${variable.key}.`))
      .finally(() => setPendingId(undefined));
  }
  return (
    <div className="divide-y divide-[var(--hairline)]">
      {variables.map((variable) => (
        <div
          key={variable.id}
          className="grid items-center gap-4 px-5 py-4 md:grid-cols-[1fr_1fr_1fr_auto]"
        >
          <code className="text-xs font-medium text-blue-200">
            {variable.key}
          </code>
          <code className="text-xs text-muted-foreground">
            {variable.value}
          </code>
          <span className="text-xs capitalize text-muted-foreground">
            {variable.targets.join(", ")}
          </span>
          <Button
            aria-label={`Delete ${variable.key}`}
            disabled={pendingId === variable.id}
            onClick={() => remove(variable)}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      {!variables.length && (
        <p className="px-5 py-12 text-center text-sm text-muted-foreground">
          No project variables yet.
        </p>
      )}
      {error && <p className="px-5 py-3 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
