import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";

export interface ScopedProject {
  id: string;
  name: string;
  slug: string;
}

export async function canAccessDashboardWorkspace(
  userId: string,
  username: string,
): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      owner: { username },
      organization: { members: { some: { userId } } },
    },
    select: { id: true },
  });
  return Boolean(project);
}

export async function getScopedProject(
  userId: string,
  username: string,
  slug: string,
): Promise<ScopedProject> {
  const project = await prisma.project.findFirst({
    where: {
      owner: { username },
      slug,
      OR: [
        { ownerId: userId },
        { organization: { members: { some: { userId } } } },
      ],
    },
    select: { id: true, name: true, slug: true },
  });
  if (!project) throw new NotFoundError("Project not found");
  return project;
}
