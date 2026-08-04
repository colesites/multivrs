import "server-only";
import { randomUUID } from "node:crypto";
import { MultivrsError, ValidationError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";
import {
  sandboxCommandResponseSchema,
  sandboxCreateResponseSchema,
} from "@/lib/schemas/sandbox.schemas";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";
import { getProject } from "@/lib/services/project.service";
import { recordUsageEvent } from "@/lib/services/usage-event.service";

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
  await getProject(userId, projectId, "deploy");
  const sandboxId = `${projectId}-${randomUUID()}`.toLowerCase();
  const active = await prisma.platformSandbox.count({
    where: { projectId, status: { in: ["creating", "running"] } },
  });
  await assertResourceAvailable({
    current: active,
    projectId,
    resource: "concurrent_sandboxes",
    userId,
  });
  await prisma.platformSandbox.create({
    data: { id: sandboxId, projectId, userId },
  });
  try {
    const response = await requestWorker("/sandboxes", {
      body: JSON.stringify({ sandboxId }),
      method: "POST",
    });
    const result = sandboxCreateResponseSchema.parse(await response.json());
    await Promise.all([
      prisma.platformSandbox.update({
        where: { id: sandboxId },
        data: { lastActiveAt: new Date(), status: "running" },
      }),
      recordUsageEvent(userId, projectId, "sandbox_creations"),
    ]);
    return result;
  } catch (error) {
    await prisma.platformSandbox.update({
      where: { id: sandboxId },
      data: { status: "error" },
    });
    throw error;
  }
}

export async function runSandboxCommand(
  userId: string,
  projectId: string,
  sandboxId: string,
  command: string,
) {
  await getProject(userId, projectId, "deploy");
  assertProjectSandbox(projectId, sandboxId);
  await assertRunningSandbox(userId, projectId, sandboxId);
  const startedAt = Date.now();
  const response = await requestWorker(`/sandboxes/${sandboxId}`, {
    body: JSON.stringify({ command }),
    method: "POST",
  });
  const result = sandboxCommandResponseSchema.parse(await response.json());
  await Promise.all([
    prisma.platformSandbox.update({
      where: { id: sandboxId },
      data: { lastActiveAt: new Date() },
    }),
    recordUsageEvent(
      userId,
      projectId,
      "sandbox_active_ms",
      Date.now() - startedAt,
    ),
    recordUsageEvent(userId, projectId, "sandbox_operations"),
  ]);
  return result;
}

export async function deleteProjectSandbox(
  userId: string,
  projectId: string,
  sandboxId: string,
) {
  await getProject(userId, projectId, "deploy");
  assertProjectSandbox(projectId, sandboxId);
  const sandbox = await assertRunningSandbox(userId, projectId, sandboxId);
  await requestWorker(`/sandboxes/${sandboxId}`, { method: "DELETE" });
  const destroyedAt = new Date();
  await Promise.all([
    prisma.platformSandbox.update({
      where: { id: sandboxId },
      data: { destroyedAt, lastActiveAt: destroyedAt, status: "destroyed" },
    }),
    recordUsageEvent(
      userId,
      projectId,
      "sandbox_provisioned_ms",
      destroyedAt.getTime() - sandbox.createdAt.getTime(),
    ),
  ]);
}

async function assertRunningSandbox(
  userId: string,
  projectId: string,
  id: string,
) {
  const sandbox = await prisma.platformSandbox.findFirst({
    where: { id, projectId, userId, status: "running" },
  });
  if (!sandbox) throw new ValidationError("Sandbox is not running");
  return sandbox;
}

function assertProjectSandbox(projectId: string, sandboxId: string) {
  if (!sandboxId.startsWith(`${projectId}-`))
    throw new ValidationError("Sandbox does not belong to this project");
}
