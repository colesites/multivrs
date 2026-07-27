import "server-only";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import type { z } from "zod";
import type {
  DashboardEmailRoute,
  EmailDomainOption,
} from "@/features/dashboard/types/email-route.types";
import { prisma } from "@/lib/prisma";
import type { createEmailRouteSchema } from "@/lib/schemas/email-route.schemas";
import {
  createCloudflareEmailRoute,
  deleteCloudflareEmailRoute,
  updateCloudflareEmailRoute,
} from "@/lib/services/cloudflare-email.service";

type CreateInput = z.infer<typeof createEmailRouteSchema>;

export async function emailDomainOptions(
  userId: string,
  projectId?: string,
): Promise<EmailDomainOption[]> {
  return prisma.domain.findMany({
    where: { userId, managed: true, ...(projectId ? { projectId } : {}) },
    select: { hostname: true, projectId: true },
    orderBy: { hostname: "asc" },
  });
}

export async function listEmailRoutes(
  userId: string,
  projectId?: string,
): Promise<DashboardEmailRoute[]> {
  const rows = await prisma.emailRoute.findMany({
    where: { userId, ...(projectId ? { projectId } : {}) },
    orderBy: { source: "asc" },
  });
  return rows.map((row) => ({
    destination: row.destination,
    enabled: row.enabled,
    id: row.id,
    projectId: row.projectId,
    source: row.source,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function createEmailRoute(
  userId: string,
  input: CreateInput,
): Promise<DashboardEmailRoute> {
  const hostname = input.source.split("@")[1]?.toLowerCase();
  const domain = hostname
    ? await prisma.domain.findFirst({
        where: { hostname, managed: true, userId },
      })
    : null;
  if (!domain)
    throw new NotFoundError("A managed domain is required for Email Routing");
  if (input.projectId && input.projectId !== domain.projectId)
    throw new NotFoundError("Domain is not connected to this project");
  const existing = await prisma.emailRoute.findUnique({
    where: { userId_source: { source: input.source.toLowerCase(), userId } },
  });
  if (existing)
    throw new ConflictError("This source address already has a route");
  const provider = await createCloudflareEmailRoute(
    input.source.toLowerCase(),
    input.destination.toLowerCase(),
  );
  const row = await prisma.emailRoute.create({
    data: {
      destination: input.destination.toLowerCase(),
      projectId: input.projectId ?? domain.projectId,
      providerRuleId: provider.providerRuleId,
      source: input.source.toLowerCase(),
      userId,
    },
  });
  return {
    destination: row.destination,
    enabled: row.enabled,
    id: row.id,
    projectId: row.projectId,
    source: row.source,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function setEmailRouteEnabled(
  userId: string,
  id: string,
  enabled: boolean,
) {
  const route = await prisma.emailRoute.findFirst({ where: { id, userId } });
  if (!route) throw new NotFoundError("Email route not found");
  if (route.providerRuleId)
    await updateCloudflareEmailRoute(
      route.source,
      route.destination,
      route.providerRuleId,
      enabled,
    );
  await prisma.emailRoute.update({ where: { id }, data: { enabled } });
}

export async function deleteEmailRoute(userId: string, id: string) {
  const route = await prisma.emailRoute.findFirst({ where: { id, userId } });
  if (!route) throw new NotFoundError("Email route not found");
  if (route.providerRuleId)
    await deleteCloudflareEmailRoute(route.source, route.providerRuleId);
  await prisma.emailRoute.delete({ where: { id } });
}
