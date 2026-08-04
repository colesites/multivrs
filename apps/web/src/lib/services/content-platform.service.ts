import "server-only";
import { randomUUID } from "node:crypto";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@multivrs/error-utils";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import type {
  BulkRedirectData,
  ContentPlatformData,
  ContentSettingsData,
  EdgeConfigEntryData,
  MicrofrontendRouteData,
} from "@/features/dashboard/types/content-platform.types";
import { prisma } from "@/lib/prisma";
import type {
  createBulkRedirectSchema,
  createMicrofrontendRouteSchema,
  setEdgeConfigEntrySchema,
  updateBulkRedirectSchema,
  updateContentSettingsSchema,
  updateMicrofrontendRouteSchema,
} from "@/lib/schemas/content-platform.schemas";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";
import { publishRuntimeConfig } from "@/lib/services/cloudflare-runtime-kv.service";
import { getProject } from "@/lib/services/project.service";
import { recordUsageEvent } from "@/lib/services/usage-event.service";

type CreateRedirectInput = z.infer<typeof createBulkRedirectSchema>;
type UpdateRedirectInput = z.infer<typeof updateBulkRedirectSchema>;
type SetEdgeConfigInput = z.infer<typeof setEdgeConfigEntrySchema>;
type CreateMicrofrontendInput = z.infer<typeof createMicrofrontendRouteSchema>;
type UpdateMicrofrontendInput = z.infer<typeof updateMicrofrontendRouteSchema>;
type UpdateContentSettingsInput = z.infer<typeof updateContentSettingsSchema>;

async function ensureSettings(projectId: string) {
  return prisma.projectContentSettings.upsert({
    where: { projectId },
    create: { projectId },
    update: {},
  });
}

function redirectData(row: {
  destination: string;
  enabled: boolean;
  id: string;
  preserveQuery: boolean;
  priority: number;
  source: string;
  statusCode: number;
}): BulkRedirectData {
  if (![301, 302, 307, 308].includes(row.statusCode)) {
    throw new ValidationError("Invalid redirect status stored for project");
  }
  return row as BulkRedirectData;
}

function microfrontendData(row: {
  enabled: boolean;
  id: string;
  priority: number;
  source: string;
  stripPrefix: boolean;
  targetProjectId: string;
  targetProject: { name: string };
}): MicrofrontendRouteData {
  return {
    enabled: row.enabled,
    id: row.id,
    priority: row.priority,
    source: row.source,
    stripPrefix: row.stripPrefix,
    targetProjectId: row.targetProjectId,
    targetProjectName: row.targetProject.name,
  };
}

export async function runtimeProjectConfig(projectId: string) {
  const settings = await ensureSettings(projectId);
  const [redirects, entries, microfrontends, cacheTags] = await Promise.all([
    prisma.bulkRedirect.findMany({
      where: { projectId, enabled: true },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      select: {
        destination: true,
        preserveQuery: true,
        source: true,
        statusCode: true,
      },
    }),
    prisma.edgeConfigEntry.findMany({ where: { projectId } }),
    prisma.microfrontendRoute.findMany({
      where: { projectId, enabled: true },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      select: { source: true, stripPrefix: true, targetProjectId: true },
    }),
    prisma.projectCacheTag.findMany({ where: { projectId } }),
  ]);
  const version = settings.routingVersion;
  return {
    bulkRedirects: redirects.map((row) => ({
      ...row,
      statusCode: row.statusCode as 301 | 302 | 307 | 308,
    })),
    cacheTagVersions: Object.fromEntries(
      cacheTags.map((row) => [row.tag, row.version]),
    ),
    edgeConfig: Object.fromEntries(entries.map((row) => [row.key, row.value])),
    microfrontends,
    version,
  };
}

async function rotateAndPublish(projectId: string): Promise<string> {
  const version = randomUUID();
  await prisma.projectContentSettings.upsert({
    where: { projectId },
    create: { edgeConfigVersion: version, projectId, routingVersion: version },
    update: { edgeConfigVersion: version, routingVersion: version },
  });
  const snapshot = await runtimeProjectConfig(projectId);
  await publishRuntimeConfig(projectId, version, snapshot);
  return version;
}

export async function getContentSettings(
  userId: string,
  projectId: string,
): Promise<ContentSettingsData> {
  await getProject(userId, projectId);
  const row = await ensureSettings(projectId);
  return {
    cacheVersion: row.cacheVersion,
    defaultRevalidate: row.defaultRevalidate,
    staleWindow: row.staleWindow,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateContentSettings(
  userId: string,
  projectId: string,
  input: UpdateContentSettingsInput,
): Promise<ContentSettingsData> {
  await getProject(userId, projectId, "update");
  await prisma.projectContentSettings.upsert({
    where: { projectId },
    create: { projectId, ...input },
    update: input,
  });
  await rotateAndPublish(projectId);
  return getContentSettings(userId, projectId);
}

export async function revalidateProjectCache(
  userId: string,
  projectId: string,
  tag?: string,
): Promise<{ cacheVersion: string; tag?: string }> {
  await getProject(userId, projectId, "update");
  if (tag) {
    await prisma.projectCacheTag.upsert({
      where: { projectId_tag: { projectId, tag } },
      create: { projectId, tag, version: randomUUID() },
      update: { version: randomUUID() },
    });
    await rotateAndPublish(projectId);
    const settings = await ensureSettings(projectId);
    return { cacheVersion: settings.cacheVersion, tag };
  }
  const cacheVersion = randomUUID();
  await prisma.projectContentSettings.upsert({
    where: { projectId },
    create: { cacheVersion, projectId },
    update: { cacheVersion },
  });
  return { cacheVersion };
}

export async function listBulkRedirects(userId: string, projectId: string) {
  await getProject(userId, projectId);
  const rows = await prisma.bulkRedirect.findMany({
    where: { projectId },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(redirectData);
}

export async function createBulkRedirect(
  userId: string,
  projectId: string,
  input: CreateRedirectInput,
) {
  await getProject(userId, projectId, "update");
  const current = await prisma.bulkRedirect.count({ where: { projectId } });
  await assertResourceAvailable({
    current,
    projectId,
    resource: "bulk_redirects",
    userId,
  });
  try {
    const row = await prisma.bulkRedirect.create({
      data: { projectId, ...input },
    });
    await rotateAndPublish(projectId);
    await recordUsageEvent(userId, projectId, "bulk_redirect_writes");
    return redirectData(row);
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      throw new ConflictError("A redirect already exists for this source path");
    }
    throw error;
  }
}

async function ownedRedirect(
  userId: string,
  projectId: string,
  redirectId: string,
) {
  await getProject(userId, projectId, "update");
  const row = await prisma.bulkRedirect.findFirst({
    where: { id: redirectId, projectId },
  });
  if (!row) throw new NotFoundError("Redirect not found");
  return row;
}

export async function updateBulkRedirect(
  userId: string,
  projectId: string,
  redirectId: string,
  input: UpdateRedirectInput,
) {
  await ownedRedirect(userId, projectId, redirectId);
  const row = await prisma.bulkRedirect.update({
    where: { id: redirectId },
    data: input,
  });
  await rotateAndPublish(projectId);
  await recordUsageEvent(userId, projectId, "bulk_redirect_writes");
  return redirectData(row);
}

export async function deleteBulkRedirect(
  userId: string,
  projectId: string,
  redirectId: string,
) {
  await ownedRedirect(userId, projectId, redirectId);
  await prisma.bulkRedirect.delete({ where: { id: redirectId } });
  await rotateAndPublish(projectId);
}

export async function listEdgeConfigEntries(userId: string, projectId: string) {
  await getProject(userId, projectId);
  const rows = await prisma.edgeConfigEntry.findMany({
    where: { projectId },
    orderBy: { key: "asc" },
  });
  return rows.map(
    (row): EdgeConfigEntryData => ({
      id: row.id,
      key: row.key,
      value: row.value,
      updatedAt: row.updatedAt.toISOString(),
    }),
  );
}

export async function setEdgeConfigEntry(
  userId: string,
  projectId: string,
  input: SetEdgeConfigInput,
) {
  await getProject(userId, projectId, "update");
  const existing = await prisma.edgeConfigEntry.findUnique({
    where: { projectId_key: { projectId, key: input.key } },
    select: { id: true },
  });
  if (!existing) {
    const current = await prisma.edgeConfigEntry.count({
      where: { projectId },
    });
    await assertResourceAvailable({
      current,
      projectId,
      resource: "edge_config_entries",
      userId,
    });
  }
  const row = await prisma.edgeConfigEntry.upsert({
    where: { projectId_key: { projectId, key: input.key } },
    create: {
      key: input.key,
      projectId,
      value: input.value as Prisma.InputJsonValue,
    },
    update: { value: input.value as Prisma.InputJsonValue },
  });
  await rotateAndPublish(projectId);
  await recordUsageEvent(userId, projectId, "edge_config_writes");
  return {
    id: row.id,
    key: row.key,
    value: row.value,
    updatedAt: row.updatedAt.toISOString(),
  } satisfies EdgeConfigEntryData;
}

export async function deleteEdgeConfigEntry(
  userId: string,
  projectId: string,
  key: string,
) {
  await getProject(userId, projectId, "update");
  const result = await prisma.edgeConfigEntry.deleteMany({
    where: { key, projectId },
  });
  if (!result.count) throw new NotFoundError("Edge Config entry not found");
  await rotateAndPublish(projectId);
}

export async function listMicrofrontends(userId: string, projectId: string) {
  await getProject(userId, projectId);
  const rows = await prisma.microfrontendRoute.findMany({
    where: { projectId },
    include: { targetProject: { select: { name: true } } },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(microfrontendData);
}

export async function createMicrofrontend(
  userId: string,
  projectId: string,
  input: CreateMicrofrontendInput,
) {
  const [source, target] = await Promise.all([
    getProject(userId, projectId, "update"),
    getProject(userId, input.targetProjectId),
  ]);
  if (source.id === target.id)
    throw new ValidationError("A project cannot mount itself");
  const current = await prisma.microfrontendRoute.count({
    where: { projectId },
  });
  await assertResourceAvailable({
    current,
    projectId,
    resource: "microfrontend_routes",
    userId,
  });
  const row = await prisma.microfrontendRoute.create({
    data: { projectId, ...input },
    include: { targetProject: { select: { name: true } } },
  });
  await rotateAndPublish(projectId);
  return microfrontendData(row);
}

async function ownedMicrofrontend(
  userId: string,
  projectId: string,
  routeId: string,
) {
  await getProject(userId, projectId, "update");
  const row = await prisma.microfrontendRoute.findFirst({
    where: { id: routeId, projectId },
  });
  if (!row) throw new NotFoundError("Microfrontend route not found");
  return row;
}

export async function updateMicrofrontend(
  userId: string,
  projectId: string,
  routeId: string,
  input: UpdateMicrofrontendInput,
) {
  await ownedMicrofrontend(userId, projectId, routeId);
  if (input.targetProjectId) await getProject(userId, input.targetProjectId);
  const row = await prisma.microfrontendRoute.update({
    where: { id: routeId },
    data: input,
    include: { targetProject: { select: { name: true } } },
  });
  await rotateAndPublish(projectId);
  return microfrontendData(row);
}

export async function deleteMicrofrontend(
  userId: string,
  projectId: string,
  routeId: string,
) {
  await ownedMicrofrontend(userId, projectId, routeId);
  await prisma.microfrontendRoute.delete({ where: { id: routeId } });
  await rotateAndPublish(projectId);
}

export async function getContentPlatform(
  userId: string,
  projectId: string,
): Promise<ContentPlatformData> {
  const project = await getProject(userId, projectId);
  const [
    settings,
    redirects,
    edgeConfig,
    microfrontends,
    blobs,
    targetProjects,
  ] = await Promise.all([
    getContentSettings(userId, projectId),
    listBulkRedirects(userId, projectId),
    listEdgeConfigEntries(userId, projectId),
    listMicrofrontends(userId, projectId),
    prisma.projectBlob.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.project.findMany({
      where: { ownerId: userId, id: { not: project.id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  return {
    blobs: blobs.map((row) => ({
      contentType: row.contentType,
      createdAt: row.createdAt.toISOString(),
      id: row.id,
      pathname: row.pathname,
      size: Number(row.size),
      status: row.status as "pending" | "ready" | "failed",
      visibility: row.visibility as "public" | "private",
    })),
    edgeConfig,
    microfrontends,
    redirects,
    settings,
    targetProjects,
  };
}

export async function getRuntimeProjectConfig(
  projectId: string,
  version?: string,
) {
  const snapshot = await runtimeProjectConfig(projectId);
  void version;
  return snapshot;
}
