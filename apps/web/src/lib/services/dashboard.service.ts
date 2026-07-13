import "server-only";
import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import {
  MOCK_DEPLOYMENTS,
  MOCK_PROJECTS,
  USE_MOCK_DATA,
} from "@/features/dashboard/constants/mock-data";
import type {
  DashboardProject,
  ProjectStatus,
} from "@/features/dashboard/types/project.types";
import { prisma } from "@/lib/prisma";

function relative(date: Date): string {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 60_000),
  );
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

function status(value?: string): ProjectStatus {
  if (value === "queued" || value === "building") return "building";
  if (value === "error" || value === "canceled") return "error";
  return "ready";
}

function duration(createdAt: Date, updatedAt: Date, state: string): string {
  if (state === "queued") return "QUEUED";
  if (state === "building") return "BUILDING";
  const seconds = Math.max(
    0,
    Math.round((updatedAt.getTime() - createdAt.getTime()) / 1000),
  );
  return seconds >= 60
    ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    : `${seconds}s`;
}

export async function dashboardProjects(
  username: string,
): Promise<DashboardProject[] | null> {
  if (USE_MOCK_DATA) return MOCK_PROJECTS;

  const owner = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!owner) return null;
  const projects = await prisma.project.findMany({
    where: { ownerId: owner.id },
    include: {
      deployments: { orderBy: { createdAt: "desc" }, take: 1 },
      domains: { where: { verified: true }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return projects.map((project) => {
    const latest = project.deployments[0];
    return {
      slug: project.slug,
      name: project.name,
      domain: project.domains[0]?.hostname ?? latest?.url ?? "Not deployed",
      repo: project.framework ?? "auto-detected",
      status: status(latest?.status),
      commitMessage: latest?.commitSha
        ? `commit ${latest.commitSha.slice(0, 7)}`
        : "Manual deployment",
      branch: latest?.branch ?? "main",
      updatedAt: relative(project.updatedAt),
    };
  });
}

export async function dashboardDeployments(
  username: string,
  projectSlug?: string,
): Promise<DashboardDeployment[] | null> {
  if (USE_MOCK_DATA) {
    return MOCK_DEPLOYMENTS.filter(
      (deployment) => !projectSlug || deployment.project === projectSlug,
    ).map((deployment) => ({
      ...deployment,
      projectId: `mock-${deployment.project}`,
      environment:
        deployment.environment === "Production" ? "Production" : "Preview",
      detailsUrl: `/${username}/${projectSlug ?? "~"}/deployments/${deployment.id}`,
    }));
  }

  const owner = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!owner) return null;
  const rows = await prisma.deployment.findMany({
    where: {
      project: {
        ownerId: owner.id,
        ...(projectSlug ? { slug: projectSlug } : {}),
      },
    },
    include: { project: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map((deployment) => ({
    id: deployment.id,
    projectId: deployment.projectId,
    project: deployment.project.name,
    status:
      deployment.status === "ready"
        ? "Ready"
        : deployment.status === "queued" || deployment.status === "building"
          ? "Building"
          : "Failed",
    branch: deployment.branch ?? "main",
    duration: duration(
      deployment.startedAt ?? deployment.createdAt,
      deployment.finishedAt ?? deployment.updatedAt,
      deployment.status,
    ),
    url: deployment.url ?? "",
    createdAt: deployment.createdAt.toISOString(),
    commitSha: deployment.commitSha?.slice(0, 7) ?? "manual",
    commitMessage: deployment.commitSha
      ? `Commit ${deployment.commitSha.slice(0, 7)}`
      : "Manual deployment",
    environment:
      deployment.project.productionDeploymentId === deployment.id
        ? "Production"
        : "Preview",
    detailsUrl: `/${username}/${projectSlug ?? "~"}/deployments/${deployment.id}`,
    errorMessage: deployment.errorMessage,
  }));
}
