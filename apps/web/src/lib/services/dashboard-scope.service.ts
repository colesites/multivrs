import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";
import { projectAccessWhere } from "@/lib/services/project-access";

export interface ScopedProject {
  id: string;
  name: string;
  slug: string;
}

/** Another account's dashboard: open to its team, and to members of its workspaces' projects. */
export async function canAccessDashboardWorkspace(
  userId: string,
  username: string,
): Promise<boolean> {
  const [teamMember, project] = await Promise.all([
    prisma.member.findFirst({
      where: { userId, organization: { accountOwner: { username } } },
      select: { id: true },
    }),
    prisma.project.findFirst({
      where: {
        owner: { username },
        organization: { members: { some: { userId } } },
      },
      select: { id: true },
    }),
  ]);
  return Boolean(teamMember ?? project);
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
      OR: projectAccessWhere(userId),
    },
    select: { id: true, name: true, slug: true },
  });
  if (!project) throw new NotFoundError("Project not found");
  return project;
}
