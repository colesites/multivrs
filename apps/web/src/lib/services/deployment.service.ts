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
import { getProject } from "@/lib/services/project.service";

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
  const project = await getProject(ownerId, projectId, "deploy");
  const row = await prisma.$transaction(async (tx) => {
    if (input.repoUrl && project.repositoryUrl !== input.repoUrl) {
      await tx.project.update({
        where: { id: projectId },
        data: { repositoryUrl: input.repoUrl },
      });
    }
    return tx.deployment.create({
      data: {
        projectId,
        status: "queued",
        target: input.target,
        branch: input.branch ?? null,
        commitSha: input.commitSha ?? null,
        renderMode: input.renderMode ?? null,
      },
    });
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
  if (!row || row.projectId !== projectId) {
    throw new NotFoundError("Deployment not found");
  }
  await getProject(ownerId, projectId, "read");
  return toDeployment(row);
}

export async function getPublicDeployment(
  deploymentId: string,
): Promise<Deployment> {
  let row = await prisma.deployment.findUnique({
    where: { id: deploymentId },
  });
  if (!row) {
    const project = await prisma.project.findFirst({
      where: { slug: deploymentId },
      include: { deployments: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (project && project.deployments.length > 0) {
      row = project.deployments[0] ?? null;
    }
  }
  if (!row) {
    throw new NotFoundError("Deployment not found");
  }
  return toDeployment(row);
}

export async function listDeployments(
  ownerId: string,
  projectId: string,
): Promise<Deployment[]> {
  await getProject(ownerId, projectId, "read");
  const rows = await prisma.deployment.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toDeployment);
}
