/**
 * Project service — all Project reads/writes go through here (never raw SQL in
 * UI/routes, per RULES.md §6). Rows are mapped to the wire contract from
 * `@multivrs/client` and validated on the way out.
 */
import "server-only";
import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from "@multivrs/client";
import { projectSchema } from "@multivrs/client";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@multivrs/error-utils";
import type { Project as ProjectRow } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/services/audit-event.service";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";
import { slugify } from "@/lib/services/slug";

function toProject(row: ProjectRow): Project {
  return projectSchema.parse({
    id: row.id,
    name: row.name,
    slug: row.slug,
    framework: row.framework,
    repositoryUrl: row.repositoryUrl,
    ownerId: row.ownerId,
    organizationId: row.organizationId,
    productionDeploymentId: row.productionDeploymentId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export async function createProject(
  ownerId: string,
  input: CreateProjectInput,
): Promise<Project> {
  const slug = input.slug ?? slugify(input.name);
  if (input.organizationId) {
    const member = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId: input.organizationId,
          userId: ownerId,
        },
      },
      select: { role: true },
    });
    if (!member || !canProject(member.role, "create")) {
      throw new ForbiddenError("Your workspace role cannot create projects");
    }
  }
  const existing = input.organizationId
    ? await prisma.project.findUnique({
        where: {
          organizationId_slug: { organizationId: input.organizationId, slug },
        },
      })
    : await prisma.project.findUnique({
        where: { ownerId_slug: { ownerId, slug } },
      });
  if (existing) {
    throw new ConflictError(`A project with slug "${slug}" already exists`);
  }
  const currentProjects = await prisma.project.count({
    where: input.organizationId
      ? { organizationId: input.organizationId }
      : { organizationId: null, ownerId },
  });
  await assertResourceAvailable({
    current: currentProjects,
    organizationId: input.organizationId,
    resource: "projects",
    userId: ownerId,
  });
  const row = await prisma.project.create({
    data: {
      name: input.name,
      slug,
      framework: input.framework ?? null,
      repositoryUrl: input.repositoryUrl ?? null,
      ownerId,
      organizationId: input.organizationId,
    },
  });
  await recordAuditEvent({
    action: "project.created",
    entityId: row.id,
    entityType: "project",
    projectId: row.id,
    userId: ownerId,
  });
  return toProject(row);
}

export async function listProjects(ownerId: string): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId },
        { organization: { members: { some: { userId: ownerId } } } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProject);
}

export async function getProject(
  ownerId: string,
  id: string,
  action: ProjectAction = "read",
): Promise<Project> {
  const row = await prisma.project.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          members: {
            where: { userId: ownerId },
            select: { role: true },
            take: 1,
          },
        },
      },
    },
  });
  const memberRole = row?.organization?.members[0]?.role;
  if (
    !row ||
    (row.ownerId !== ownerId &&
      (!memberRole || !canProject(memberRole, action)))
  ) {
    throw new NotFoundError("Project not found");
  }
  return toProject(row);
}

export async function updateProject(
  ownerId: string,
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  await getProject(ownerId, id, "update");
  const row = await prisma.project.update({
    data: {
      framework: input.framework,
      name: input.name,
      repositoryUrl: input.repositoryUrl,
    },
    where: { id },
  });
  await recordAuditEvent({
    action: "project.updated",
    entityId: id,
    entityType: "project",
    projectId: id,
    userId: ownerId,
  });
  return toProject(row);
}

export async function deleteProject(
  ownerId: string,
  id: string,
): Promise<void> {
  await getProject(ownerId, id, "delete");
  await recordAuditEvent({
    action: "project.deleted",
    entityId: id,
    entityType: "project",
    projectId: id,
    userId: ownerId,
  });
  await prisma.project.delete({ where: { id } });
}

export type ProjectAction = "create" | "delete" | "deploy" | "read" | "update";

function canProject(role: string, action: ProjectAction): boolean {
  if (role === "owner" || role === "admin") return true;
  if (role === "developer") return action !== "delete";
  return action === "read" && (role === "viewer" || role === "billing");
}
