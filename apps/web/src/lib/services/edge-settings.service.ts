import "server-only";
import { MultivrsError } from "@multivrs/error-utils";
import type { z } from "zod";
import type { EdgeSettingsData } from "@/features/dashboard/types/edge-settings.types";
import { prisma } from "@/lib/prisma";
import type { updateEdgeSettingsSchema } from "@/lib/schemas/edge-settings.schemas";
import { getProject } from "@/lib/services/project.service";

type UpdateEdgeSettingsInput = z.infer<typeof updateEdgeSettingsSchema>;

const DEFAULTS: EdgeSettingsData = {
  analyticsEnabled: true,
  attackMode: false,
  browserTtl: 0,
  cacheMode: "smart",
  edgeTtl: 3600,
  speedInsightsEnabled: true,
  updatedAt: null,
};

function cloudflareError(message: string): MultivrsError {
  return new MultivrsError("internal_error", message, 502);
}

export async function getEdgeSettings(
  userId: string,
  projectId: string,
): Promise<EdgeSettingsData> {
  await getProject(userId, projectId);
  const row = await prisma.projectEdgeSettings.findUnique({
    where: { projectId },
  });
  if (!row) return DEFAULTS;
  return {
    analyticsEnabled: row.analyticsEnabled,
    attackMode: row.attackMode,
    browserTtl: row.browserTtl,
    cacheMode:
      row.cacheMode === "bypass" || row.cacheMode === "aggressive"
        ? row.cacheMode
        : "smart",
    edgeTtl: row.edgeTtl,
    speedInsightsEnabled: row.speedInsightsEnabled,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateEdgeSettings(
  userId: string,
  projectId: string,
  input: UpdateEdgeSettingsInput,
): Promise<EdgeSettingsData> {
  await getProject(userId, projectId, "update");
  await prisma.projectEdgeSettings.upsert({
    where: { projectId },
    create: { projectId, ...input },
    update: input,
  });
  return getEdgeSettings(userId, projectId);
}

export async function purgeProjectCache(
  userId: string,
  projectId: string,
): Promise<void> {
  await getProject(userId, projectId, "update");
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!zoneId || !token)
    throw cloudflareError("Cloudflare cache purge is not configured");
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { domains: true },
  });
  const deploymentDomain = process.env.MULTIVRS_DEPLOYMENT_DOMAIN;
  const hosts = [
    ...(project?.domains.map((domain) => domain.hostname) ?? []),
    ...(deploymentDomain && project
      ? [`${project.slug}.${deploymentDomain}`]
      : []),
  ];
  if (!hosts.length) return;
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      body: JSON.stringify({ hosts }),
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      method: "POST",
    },
  );
  if (!response.ok)
    throw cloudflareError(`Cloudflare cache purge failed (${response.status})`);
}
