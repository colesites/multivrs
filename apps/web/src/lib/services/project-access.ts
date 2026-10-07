import type { Prisma } from "@prisma/client";

/**
 * Who can open a project: its owner, members of the workspace it belongs
 * to, and, for a personal project, members of the owner's account team.
 * Use it as the `OR` of a project query.
 */
export function projectAccessWhere(userId: string): Prisma.ProjectWhereInput[] {
  return [
    { ownerId: userId },
    { organization: { members: { some: { userId } } } },
    {
      organizationId: null,
      owner: { accountTeam: { members: { some: { userId } } } },
    },
  ];
}

/** Selects the viewer's role on a project, for `projectRole`. */
export function projectRoleInclude(userId: string) {
  const role = {
    members: { where: { userId }, select: { role: true }, take: 1 },
  } as const;
  return {
    organization: { select: role },
    owner: { select: { accountTeam: { select: role } } },
  } satisfies Prisma.ProjectInclude;
}

type WithRoles = {
  organizationId: string | null;
  organization: { members: { role: string }[] } | null;
  owner: { accountTeam: { members: { role: string }[] } | null };
};

/** The viewer's role from the workspace, or from the owner's team for a personal project. */
export function projectRole(project: WithRoles): string | undefined {
  return project.organizationId
    ? project.organization?.members[0]?.role
    : project.owner.accountTeam?.members[0]?.role;
}
