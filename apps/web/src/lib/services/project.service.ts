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
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import type { Project as ProjectRow } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/services/audit-event.service";
import { slugify } from "@/lib/services/slug";

function toProject(row: ProjectRow): Project {
  return projectSchema.parse({
    id: row.id,
    name: row.name,
    slug: row.slug,
    framework: row.framework,
    ownerId: row.ownerId,
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
  const existing = await prisma.project.findUnique({
    where: { ownerId_slug: { ownerId, slug } },
  });
  if (existing) {
    throw new ConflictError(`A project with slug "${slug}" already exists`);
  }
  const row = await prisma.project.create({
    data: {
      name: input.name,
      slug,
      framework: input.framework ?? null,
      ownerId,
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
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProject);
}

export async function getProject(
  ownerId: string,
  id: string,
): Promise<Project> {
  const row = await prisma.project.findUnique({ where: { id } });
  if (!row || row.ownerId !== ownerId) {
    throw new NotFoundError("Project not found");
  }
  return toProject(row);
}

export async function updateProject(
  ownerId: string,
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  await getProject(ownerId, id);
  const row = await prisma.project.update({
    data: { framework: input.framework, name: input.name },
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
  await getProject(ownerId, id);
  await recordAuditEvent({
    action: "project.deleted",
    entityId: id,
    entityType: "project",
    projectId: id,
    userId: ownerId,
  });
  await prisma.project.delete({ where: { id } });
}
