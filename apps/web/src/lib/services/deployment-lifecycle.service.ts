import "server-only";
import type { Deployment } from "@multivrs/client";
import { ConflictError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";
import { getDeployment, toDeployment } from "@/lib/services/deployment.service";

export async function markDeploymentBuilding(
  ownerId: string,
  projectId: string,
  deploymentId: string,
): Promise<Deployment> {
  await getDeployment(ownerId, projectId, deploymentId);
  const row = await prisma.deployment.update({
    where: { id: deploymentId },
    data: { status: "building", startedAt: new Date() },
  });
  return toDeployment(row);
}

export async function markDeploymentReady(
  ownerId: string,
  projectId: string,
  deploymentId: string,
  input: { artifactHash: string; url: string },
): Promise<Deployment> {
  const current = await getDeployment(ownerId, projectId, deploymentId);
  const row = await prisma.$transaction(async (tx) => {
    const deployment = await tx.deployment.update({
      where: { id: deploymentId },
      data: {
        status: "ready",
        artifactHash: input.artifactHash,
        url: input.url,
        finishedAt: new Date(),
        errorMessage: null,
      },
    });
    if (current.target === "production") {
      await tx.project.update({
        where: { id: projectId },
        data: { productionDeploymentId: deploymentId },
      });
    }
    return deployment;
  });
  return toDeployment(row);
}

export async function markDeploymentError(
  ownerId: string,
  projectId: string,
  deploymentId: string,
  message?: string,
): Promise<Deployment> {
  await getDeployment(ownerId, projectId, deploymentId);
  const row = await prisma.deployment.update({
    where: { id: deploymentId },
    data: {
      status: "error",
      finishedAt: new Date(),
      errorMessage: message ?? null,
    },
  });
  return toDeployment(row);
}

export async function transitionDeployment(
  ownerId: string,
  projectId: string,
  deploymentId: string,
  status: "building" | "error" | "canceled",
  message?: string,
): Promise<Deployment> {
  const deployment = await getDeployment(ownerId, projectId, deploymentId);
  const allowed =
    deployment.status === "queued"
      ? ["building", "error", "canceled"]
      : deployment.status === "building"
        ? ["error", "canceled"]
        : [];
  if (!allowed.includes(status)) {
    throw new ConflictError(
      `Cannot transition deployment from ${deployment.status} to ${status}`,
    );
  }
  const terminal = status === "error" || status === "canceled";
  const row = await prisma.deployment.update({
    where: { id: deploymentId },
    data: {
      status,
      startedAt: status === "building" ? new Date() : undefined,
      finishedAt: terminal ? new Date() : undefined,
      errorMessage: status === "error" ? (message ?? null) : undefined,
    },
  });
  return toDeployment(row);
}
