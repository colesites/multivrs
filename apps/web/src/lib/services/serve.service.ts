import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";

export interface ServeResolution {
  deploymentId: string;
  artifactHash: string;
}

function readyResolution(
  deployment: {
    id: string;
    status: string;
    artifactHash: string | null;
  } | null,
): ServeResolution {
  if (
    !deployment ||
    deployment.status !== "ready" ||
    !deployment.artifactHash
  ) {
    throw new NotFoundError("Ready deployment not found");
  }
  return { deploymentId: deployment.id, artifactHash: deployment.artifactHash };
}

export async function resolveHostname(
  hostname: string,
): Promise<ServeResolution> {
  const clean = hostname.toLowerCase().split(":")[0] ?? hostname;
  const custom = await prisma.domain.findUnique({
    where: { hostname: clean },
    include: { project: { include: { productionDeployment: true } } },
  });
  if (custom?.verified && custom.certStatus === "active") {
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
  if (deployment) {
    return readyResolution(deployment);
  }
  const project = await prisma.project.findUnique({
    where: { slug: alias },
    include: { productionDeployment: true },
  });
  return readyResolution(project?.productionDeployment ?? null);
}

export function deploymentUrl(deploymentId: string): string {
  const baseDomain = process.env.MULTIVRS_DEPLOYMENT_DOMAIN;
  return baseDomain
    ? `https://${deploymentId}.${baseDomain}`
    : `/api/deployments/${deploymentId}/serve`;
}
