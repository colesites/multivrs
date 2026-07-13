/**
 * Deployment service. A new deployment starts in `queued`; the build pipeline
 * (Phase 1) advances status and fills in artifactHash/url later. Ownership is
 * enforced via the parent project.
 */
import "server-only";
import type { CreateDeploymentInput, Deployment } from "@multivrs/client";
import { deploymentSchema } from "@multivrs/client";
import { NotFoundError } from "@multivrs/error-utils";
import type { Deployment as DeploymentRow } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function toDeployment(row: DeploymentRow): Deployment {
  return deploymentSchema.parse({
    id: row.id,
    projectId: row.projectId,
    status: row.status,
    target: row.target,
    renderMode: row.renderMode,
    commitSha: row.commitSha,
    branch: row.branch,
    artifactHash: row.artifactHash,
    url: row.url,
    startedAt: row.startedAt?.toISOString() ?? null,
    finishedAt: row.finishedAt?.toISOString() ?? null,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export async function createDeployment(
  ownerId: string,
  projectId: string,
  input: CreateDeploymentInput,
): Promise<Deployment> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== ownerId) {
    throw new NotFoundError("Project not found");
  }
  const row = await prisma.deployment.create({
    data: {
      projectId,
      status: "queued",
      target: input.target,
      branch: input.branch ?? null,
      commitSha: input.commitSha ?? null,
      renderMode: input.renderMode ?? null,
    },
  });
  return toDeployment(row);
}

export async function getDeployment(
  ownerId: string,
  projectId: string,
  deploymentId: string,
): Promise<Deployment> {
  const row = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { project: true },
  });
  if (!row || row.projectId !== projectId || row.project.ownerId !== ownerId) {
    throw new NotFoundError("Deployment not found");
  }
  return toDeployment(row);
}

export async function getPublicDeployment(
  deploymentId: string,
): Promise<Deployment> {
  const row = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });
  if (!row) {
    throw new NotFoundError("Deployment not found");
  }
  return toDeployment(row);
}

export async function listDeployments(
  ownerId: string,
  projectId: string,
): Promise<Deployment[]> {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== ownerId) {
    throw new NotFoundError("Project not found");
  }
  const rows = await prisma.deployment.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDeployment);
}
