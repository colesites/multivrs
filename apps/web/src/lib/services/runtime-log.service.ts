import "server-only";
import type {
  RuntimeLogItem,
  RuntimeLogLevel,
} from "@/features/dashboard/types/runtime-log.types";
import { prisma } from "@/lib/prisma";
import { getScopedProject } from "@/lib/services/dashboard-scope.service";
import { deliverLogDrains } from "@/lib/services/log-drain.service";

interface RuntimeLogBatch {
  deploymentId: string;
  logs: Array<{
    level: RuntimeLogLevel;
    message: string;
    requestId?: string;
    traceId?: string;
  }>;
}

function level(value: string): RuntimeLogLevel {
  if (value === "error" || value === "warn") return value;
  return "info";
}

export async function listProjectRuntimeLogs(
  userId: string,
  username: string,
  projectSlug: string,
): Promise<RuntimeLogItem[]> {
  const project = await getScopedProject(userId, username, projectSlug);
  const rows = await prisma.deploymentLog.findMany({
    where: {
      deployment: { projectId: project.id },
    },
    include: { deployment: { select: { id: true, status: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map((row) => ({
    deploymentId: row.deploymentId,
    id: row.id,
    level: level(row.level),
    message: row.message,
    source: row.source,
    timestamp: row.createdAt.toISOString(),
  }));
}

export async function ingestRuntimeLogs(batch: RuntimeLogBatch) {
  const deployment = await prisma.deployment.findUnique({
    where: { id: batch.deploymentId },
    select: { id: true, projectId: true },
  });
  if (!deployment) return { accepted: 0 };
  const result = await prisma.deploymentLog.createMany({
    data: batch.logs.map((log) => ({
      deploymentId: batch.deploymentId,
      level: log.level,
      message: log.message,
      requestId: log.requestId,
      source: "runtime",
      traceId: log.traceId,
    })),
  });
  await deliverLogDrains(deployment.projectId, deployment.id, batch.logs);
  return { accepted: result.count };
}
