import "server-only";
import type { CreateDeploymentLogInput, DeploymentLog } from "@multivrs/client";
import { deploymentLogSchema } from "@multivrs/client";
import { prisma } from "@/lib/prisma";
import { getDeployment } from "@/lib/services/deployment.service";

function toLog(row: {
  id: string;
  deploymentId: string;
  level: string;
  message: string;
  createdAt: Date;
}): DeploymentLog {
  return deploymentLogSchema.parse({
    ...row,
    createdAt: row.createdAt.toISOString(),
  });
}

export async function appendDeploymentLog(
  ownerId: string,
  projectId: string,
  deploymentId: string,
  input: CreateDeploymentLogInput,
): Promise<DeploymentLog> {
  await getDeployment(ownerId, projectId, deploymentId);
  const row = await prisma.deploymentLog.create({
    data: { deploymentId, level: input.level, message: input.message },
  });
  return toLog(row);
}

export async function listDeploymentLogs(
  ownerId: string,
  projectId: string,
  deploymentId: string,
): Promise<DeploymentLog[]> {
  await getDeployment(ownerId, projectId, deploymentId);
  const rows = await prisma.deploymentLog.findMany({
    where: { deploymentId },
    orderBy: { createdAt: "asc" },
    take: 1_000,
  });
  return rows.map(toLog);
}
