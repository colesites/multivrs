import "server-only";
import type { ObservabilityData } from "@/features/dashboard/types/observability.types";
import { prisma } from "@/lib/prisma";
import { getProjectAnalytics } from "@/lib/services/analytics.service";
import { getProject } from "@/lib/services/project.service";

export async function getProjectObservability(
  userId: string,
  projectId: string,
): Promise<ObservabilityData> {
  await getProject(userId, projectId);
  const [analytics, activeDeployments, errorDeployments, errors] =
    await Promise.all([
      getProjectAnalytics(projectId),
      prisma.deployment.count({
        where: { projectId, status: { in: ["queued", "building", "ready"] } },
      }),
      prisma.deployment.count({ where: { projectId, status: "error" } }),
      prisma.deploymentLog.findMany({
        where: { deployment: { projectId }, level: "error" },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, deploymentId: true, message: true },
        take: 8,
      }),
    ]);
  return {
    activeDeployments,
    averageLatency: analytics.averageLatency,
    errorDeployments,
    errorRate: analytics.errorRate,
    recentErrors: errors.map((error) => ({
      ...error,
      createdAt: error.createdAt.toISOString(),
    })),
    requests: analytics.requests,
    state: analytics.state,
  };
}
