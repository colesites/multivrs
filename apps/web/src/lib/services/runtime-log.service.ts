import "server-only";
import type {
  RuntimeLogItem,
  RuntimeLogLevel,
} from "@/features/dashboard/types/runtime-log.types";
import { prisma } from "@/lib/prisma";

function level(value: string): RuntimeLogLevel {
  if (value === "error" || value === "warn") return value;
  return "info";
}

export async function listProjectRuntimeLogs(
  userId: string,
  username: string,
  projectSlug: string,
): Promise<RuntimeLogItem[]> {
  const rows = await prisma.deploymentLog.findMany({
    where: {
      deployment: {
        project: { ownerId: userId, owner: { username }, slug: projectSlug },
      },
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
    source: row.deployment.status === "building" ? "build" : "deployment",
    timestamp: row.createdAt.toISOString(),
  }));
}
