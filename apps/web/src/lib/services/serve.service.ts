import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import { type FirewallRule, firewallRuleSchema } from "@multivrs/firewall";
import { prisma } from "@/lib/prisma";
import { deploymentEnvironment } from "@/lib/services/environment-variable.service";

export interface ServeResolution {
  analyticsEnabled: boolean;
  deploymentId: string;
  artifactHash: string;
  projectId: string;
  runtimeEnvironment: Record<string, string>;
  firewallRules: FirewallRule[];
  attackMode: boolean;
  browserTtl: number;
  cacheMode: "aggressive" | "bypass" | "smart";
  edgeTtl: number;
  speedInsightsEnabled: boolean;
  cacheVersion: string;
  defaultRevalidate: number;
  runtimeConfigVersion: string;
  staleWindow: number;
}

async function readyResolution(
  deployment: {
    id: string;
    projectId: string;
    status: string;
    artifactHash: string | null;
    target: string;
  } | null,
): Promise<ServeResolution> {
  if (deployment?.status !== "ready" || !deployment.artifactHash) {
    throw new NotFoundError("Ready deployment not found");
  }
  const [rows, settings, contentSettings, runtimeEnvironment] =
    await Promise.all([
      prisma.firewallRule.findMany({
        where: { projectId: deployment.projectId, enabled: true },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      }),
      prisma.projectEdgeSettings.findUnique({
        where: { projectId: deployment.projectId },
        select: {
          analyticsEnabled: true,
          attackMode: true,
          browserTtl: true,
          cacheMode: true,
          edgeTtl: true,
          speedInsightsEnabled: true,
        },
      }),
      prisma.projectContentSettings.upsert({
        where: { projectId: deployment.projectId },
        create: { projectId: deployment.projectId },
        update: {},
        select: {
          cacheVersion: true,
          defaultRevalidate: true,
          routingVersion: true,
          staleWindow: true,
        },
      }),
      deploymentEnvironment(
        deployment.projectId,
        deployment.target === "production" ? "production" : "preview",
      ),
    ]);
  const firewallRules = rows.map((row) =>
    firewallRuleSchema.parse({
      action: row.action,
      conditions: row.conditions,
      enabled: row.enabled,
      id: row.id,
    }),
  );
  return {
    analyticsEnabled: settings?.analyticsEnabled ?? true,
    artifactHash: deployment.artifactHash,
    attackMode: settings?.attackMode ?? false,
    browserTtl: settings?.browserTtl ?? 0,
    cacheMode:
      settings?.cacheMode === "aggressive" || settings?.cacheMode === "bypass"
        ? settings.cacheMode
        : "smart",
    deploymentId: deployment.id,
    edgeTtl: settings?.edgeTtl ?? 3600,
    firewallRules,
    projectId: deployment.projectId,
    runtimeEnvironment,
    speedInsightsEnabled: settings?.speedInsightsEnabled ?? true,
    cacheVersion: contentSettings.cacheVersion,
    defaultRevalidate: contentSettings.defaultRevalidate,
    runtimeConfigVersion: contentSettings.routingVersion,
    staleWindow: contentSettings.staleWindow,
  };
}

export async function resolveProjectId(
  projectId: string,
): Promise<ServeResolution> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { productionDeployment: true },
  });
  return readyResolution(project?.productionDeployment ?? null);
}

export async function resolveHostname(
  hostname: string,
): Promise<ServeResolution> {
  const clean = hostname.toLowerCase().split(":")[0] ?? hostname;
  const custom = await prisma.domain.findUnique({
    where: { hostname: clean },
    include: { project: { include: { productionDeployment: true } } },
  });
  if (custom?.project && custom.verified && custom.certStatus === "active") {
    return readyResolution(custom.project.productionDeployment);
  }
  const baseDomain = process.env.MULTIVRS_DEPLOYMENT_DOMAIN?.toLowerCase();
  if (!baseDomain || !clean.endsWith(`.${baseDomain}`)) {
    throw new NotFoundError("Deployment hostname not found");
  }
  const alias = clean.slice(0, -(baseDomain.length + 1));
  const deployment = await prisma.deployment.findUnique({
    where: { id: alias },
  });
  if (deployment) return readyResolution(deployment);
  const project = await prisma.project.findFirst({
    where: { slug: alias },
    include: { productionDeployment: true },
  });
  return readyResolution(project?.productionDeployment ?? null);
}

export function deploymentUrl(deploymentId: string): string {
  const baseDomain = process.env.MULTIVRS_DEPLOYMENT_DOMAIN;
  if (!baseDomain && process.env.NODE_ENV === "development") {
    return `http://${deploymentId}.localhost:3000`;
  }
  return baseDomain
    ? `${process.env.MULTIVRS_DEPLOYMENT_PROTOCOL ?? "https"}://${deploymentId}.${baseDomain}`
    : `/api/deployments/${deploymentId}/serve`;
}
