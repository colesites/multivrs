import "server-only";
import { randomUUID } from "node:crypto";
import { MultivrsError, ValidationError } from "@multivrs/error-utils";
import {
  sandboxCommandResponseSchema,
  sandboxCreateResponseSchema,
} from "@/lib/schemas/sandbox.schemas";
import { getProject } from "@/lib/services/project.service";

function config() {
  const url = process.env.CLOUDFLARE_BUILD_WORKER_URL;
  const token = process.env.CLOUDFLARE_BUILD_WORKER_TOKEN;
  if (!url || !token)
    throw new MultivrsError(
      "internal_error",
      "Cloudflare Sandboxes are not configured",
      503,
    );
  return { token, url };
}

async function requestWorker(path: string, init: RequestInit) {
  const worker = config();
  const response = await fetch(new URL(path, worker.url), {
    ...init,
    headers: {
      authorization: `Bearer ${worker.token}`,
      "content-type": "application/json",
    },
  });
  if (!response.ok)
    throw new MultivrsError(
      "internal_error",
      `Sandbox service returned ${response.status}`,
      502,
    );
  return response;
}

export async function createProjectSandbox(userId: string, projectId: string) {
  await getProject(userId, projectId);
  const sandboxId = `${projectId}-${randomUUID()}`.toLowerCase();
  const response = await requestWorker("/sandboxes", {
    body: JSON.stringify({ sandboxId }),
    method: "POST",
  });
  return sandboxCreateResponseSchema.parse(await response.json());
}

export async function runSandboxCommand(
  userId: string,
  projectId: string,
  sandboxId: string,
  command: string,
) {
  await getProject(userId, projectId);
  assertProjectSandbox(projectId, sandboxId);
  const response = await requestWorker(`/sandboxes/${sandboxId}`, {
    body: JSON.stringify({ command }),
    method: "POST",
  });
  return sandboxCommandResponseSchema.parse(await response.json());
}

export async function deleteProjectSandbox(
  userId: string,
  projectId: string,
  sandboxId: string,
) {
  await getProject(userId, projectId);
  assertProjectSandbox(projectId, sandboxId);
  await requestWorker(`/sandboxes/${sandboxId}`, { method: "DELETE" });
}

function assertProjectSandbox(projectId: string, sandboxId: string) {
  if (!sandboxId.startsWith(`${projectId}-`))
    throw new ValidationError("Sandbox does not belong to this project");
}
