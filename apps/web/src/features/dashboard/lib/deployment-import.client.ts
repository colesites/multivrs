import {
  deploymentLogSchema,
  deploymentSchema,
  projectSchema,
} from "@multivrs/client";
import { z } from "zod";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";

const errorSchema = z.object({ error: z.object({ message: z.string() }) });
const logsSchema = z.array(deploymentLogSchema);

async function failure(response: Response, fallback: string) {
  const parsed = errorSchema.safeParse(await response.json().catch(() => null));
  return new Error(parsed.success ? parsed.data.error.message : fallback);
}

export async function createImportProject(config: DeploymentImportConfig) {
  const response = await fetch("/api/projects", {
    body: JSON.stringify({
      framework: config.framework,
      name: config.projectName.trim(),
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw await failure(response, "Project creation failed");
  return projectSchema.parse(await response.json());
}

export async function queueImportDeployment(
  projectId: string,
  config: DeploymentImportConfig,
  source: RepositorySource,
) {
  const response = await fetch(`/api/projects/${projectId}/deployments`, {
    body: JSON.stringify({
      branch: source.branch,
      buildCommand: config.buildCommand.trim() || undefined,
      env: Object.fromEntries(
        config.environment.flatMap((item) =>
          item.key.trim() ? [[item.key.trim(), item.value]] : [],
        ),
      ),
      installCommand: config.installCommand.trim() || undefined,
      outputDirectory: config.outputDirectory.trim() || undefined,
      repoUrl: source.url,
      rootDirectory: config.rootDirectory.trim() || ".",
      target: "production",
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!response.ok)
    throw await failure(response, "Deployment could not be queued");
  return deploymentSchema.parse(await response.json());
}

export async function getImportProgress(
  projectId: string,
  deploymentId: string,
) {
  const [statusResponse, logsResponse] = await Promise.all([
    fetch(`/api/projects/${projectId}/deployments/${deploymentId}`),
    fetch(`/api/projects/${projectId}/deployments/${deploymentId}/logs`),
  ]);
  if (!statusResponse.ok) throw new Error("Deployment status is unavailable");
  return {
    deployment: deploymentSchema.parse(await statusResponse.json()),
    logs: logsResponse.ok ? logsSchema.parse(await logsResponse.json()) : [],
  };
}
