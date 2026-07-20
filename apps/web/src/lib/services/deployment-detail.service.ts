import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  DashboardDeploymentDetail,
  DashboardDeploymentLog,
} from "@/lib/services/deployment-detail.types";

type DeploymentLogRow = Omit<DashboardDeploymentLog, "createdAt"> & {
  createdAt: Date;
};

export async function dashboardDeploymentDetail(
  username: string,
  scope: string,
  deploymentId: string,
): Promise<DashboardDeploymentDetail | null> {
  const deployment = await prisma.deployment.findFirst({
    where: {
      id: deploymentId,
      project: {
        owner: { username },
        ...(scope === "~" ? {} : { slug: scope }),
      },
    },
    include: {
      project: true,
      logs: { orderBy: { createdAt: "asc" }, take: 1_000 },
    },
  });
  if (!deployment) return null;
  return {
    id: deployment.id,
    project: deployment.project.name,
    status: deployment.status,
    url: deployment.url,
    branch: deployment.branch ?? "main",
    commitSha: deployment.commitSha,
    errorMessage: deployment.errorMessage,
    createdAt: deployment.createdAt.toISOString(),
    logs: deployment.logs.map((log: DeploymentLogRow) => ({
      id: log.id,
      level: log.level,
      message: log.message,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}
