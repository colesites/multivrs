import "server-only";
import { cache } from "react";
import type { DashboardDeployment } from "@/features/dashboard/components/DeploymentsPage";
import type {
  DashboardProject,
  ProjectStatus,
} from "@/features/dashboard/types/project.types";
import { prisma } from "@/lib/prisma";
import { deploymentUrl } from "@/lib/services/serve.service";
import { SITE_URL } from "@/lib/site";

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
  if (!value) return "idle";
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

export const dashboardProjects = cache(async function dashboardProjects(
  username: string,
  viewerId: string,
): Promise<DashboardProject[] | null> {
  const owner = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!owner) return null;
  const projects = await prisma.project.findMany({
    where: {
      ownerId: owner.id,
      OR: [
        { ownerId: viewerId },
        { organization: { members: { some: { userId: viewerId } } } },
      ],
    },
    include: {
      deployments: { orderBy: { createdAt: "desc" }, take: 1 },
      domains: { where: { verified: true }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return projects.map((project) => {
    const latest = project.deployments[0];
    const hostname = project.domains[0]?.hostname ?? null;
    const generatedDeploymentUrl = latest
      ? (latest.url ?? deploymentUrl(latest.id))
      : null;
    const siteUrl = hostname ? `https://${hostname}` : generatedDeploymentUrl;
    const repositoryLabel = project.repositoryUrl
      ? new URL(project.repositoryUrl).pathname
          .replace(/^\//, "")
          .replace(/\.git$/, "")
      : null;
    return {
      id: project.id,
      slug: project.slug,
      name: project.name,
      siteUrl,
      siteLabel: hostname ?? hostLabel(generatedDeploymentUrl),
      faviconUrl: siteUrl ? faviconUrl(siteUrl) : null,
      repositoryUrl: project.repositoryUrl,
      repositoryLabel,
      status: status(latest?.status),
      latestDeployment: latest
        ? {
            id: latest.id,
            label: latest.commitSha
              ? `Commit ${latest.commitSha.slice(0, 7)}`
              : `Deployment ${latest.id.slice(0, 8)}`,
            branch: latest.branch ?? "main",
            createdAt: relative(latest.createdAt),
          }
        : null,
    };
  });
});

function hostLabel(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return "Deployment preview";
  try {
    return new URL(url).host || null;
  } catch {
    return null;
  }
}

function faviconUrl(url: string): string | null {
  try {
    return new URL("/favicon.ico", new URL(url, SITE_URL)).toString();
  } catch {
    return null;
  }
}

export async function dashboardDeployments(
  viewerId: string,
  username: string,
  projectSlug?: string,
): Promise<DashboardDeployment[] | null> {
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
        OR: [
          { ownerId: viewerId },
          { organization: { members: { some: { userId: viewerId } } } },
        ],
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
    commitSha: deployment.commitSha?.slice(0, 7) ?? "—",
    commitMessage: deployment.commitSha
      ? `Commit ${deployment.commitSha.slice(0, 7)}`
      : `Deployment ${deployment.id.slice(0, 8)}`,
    environment:
      deployment.project.productionDeploymentId === deployment.id
        ? "Production"
        : "Preview",
    detailsUrl: `/${username}/${projectSlug ?? "~"}/deployments/${deployment.id}`,
    errorMessage: deployment.errorMessage,
  }));
}
