import { KeyRound } from "lucide-react";
import { EnvironmentVariableForm } from "@/features/dashboard/components/EnvironmentVariableForm";
import { EnvironmentVariableRows } from "@/features/dashboard/components/EnvironmentVariableRows";
import type { DashboardEnvironmentVariable } from "@/features/dashboard/types/environment-variable.types";

export function EnvironmentVariablesPage({
  projectId,
  projectName,
  variables,
}: {
  projectId: string;
  projectName: string;
  variables: DashboardEnvironmentVariable[];
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-5 py-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-purple-400">
            Secure configuration
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Environment Variables
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Encrypted build and runtime configuration for {projectName}.
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/[0.06]">
          <KeyRound className="size-5 text-purple-300" />
        </div>
      </header>
      <section className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-background/70">
        <div className="border-b border-[var(--hairline)] px-5 py-4">
          <h2 className="text-sm font-semibold">Project variables</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Values are encrypted with AES-256-GCM and never shown again.
          </p>
        </div>
        <EnvironmentVariableForm projectId={projectId} />
        <EnvironmentVariableRows projectId={projectId} variables={variables} />
      </section>
      <p className="text-xs leading-5 text-muted-foreground">
        Changes apply to new deployments. Redeploy the project after updating a
        build-time variable.
      </p>
    </div>
  );
}
