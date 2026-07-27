import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";

export interface ScopedProject {
  id: string;
  name: string;
  slug: string;
}

export async function getScopedProject(
  userId: string,
  username: string,
  slug: string,
): Promise<ScopedProject> {
  const project = await prisma.project.findFirst({
    where: { ownerId: userId, owner: { username }, slug },
    select: { id: true, name: true, slug: true },
  });
  if (!project) throw new NotFoundError("Project not found");
  return project;
}

export async function getScopedProjectIds(
  userId: string,
  username: string,
  slug?: string,
): Promise<string[]> {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId, owner: { username }, ...(slug ? { slug } : {}) },
    select: { id: true },
  });
  return projects.map((project) => project.id);
}
