import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface AuditEventInput {
  action: string;
  entityId?: string;
  entityType: string;
  metadata?: Prisma.InputJsonValue;
  projectId?: string;
  userId: string;
}

export async function recordAuditEvent(input: AuditEventInput): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      action: input.action,
      entityId: input.entityId,
      entityType: input.entityType,
      metadata: input.metadata,
      projectId: input.projectId,
      userId: input.userId,
    },
  });
}

export interface DashboardAuditEvent {
  action: string;
  createdAt: string;
  entityType: string;
  id: string;
  projectName: string | null;
}

export async function listAuditEvents(
  userId: string,
): Promise<DashboardAuditEvent[]> {
  const rows = await prisma.auditEvent.findMany({
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
    where: { userId },
  });
  return rows.map((row) => ({
    action: row.action,
    createdAt: row.createdAt.toISOString(),
    entityType: row.entityType,
    id: row.id,
    projectName: row.project?.name ?? null,
  }));
}
