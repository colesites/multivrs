import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
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
    <div className="w-full space-y-6 px-5 py-6">
      <DashboardPageHeader
        title="Environment Variables"
        description={
          <>Encrypted build and runtime configuration for {projectName}.</>
        }
      />
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
