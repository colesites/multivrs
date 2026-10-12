import "server-only";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import type { DashboardWorkspace } from "@/features/dashboard/types/workspace.types";
import { prisma } from "@/lib/prisma";
import {
  adoptionBlocker,
  teamSlugBase,
  teamSlugCandidates,
} from "@/lib/services/account-team.helpers";

/**
 * Every account has one team. People on it can open the account's
 * personal projects with their role; billing stays on the account's plan.
 * It's a Better Auth organization marked with `accountOwnerId`.
 */
export interface AccountTeam {
  id: string;
  name: string;
  slug: string;
}

const TEAM = { id: true, name: true, slug: true } as const;

export function findAccountTeam(userId: string): Promise<AccountTeam | null> {
  return prisma.organization.findUnique({
    where: { accountOwnerId: userId },
    select: TEAM,
  });
}

async function freeSlug(base: string): Promise<string> {
  const candidates = teamSlugCandidates(base);
  const taken = await prisma.organization.findMany({
    where: { slug: { in: candidates } },
    select: { slug: true },
  });
  const used = new Set(taken.map((t) => t.slug));
  return (
    candidates.find((slug) => !used.has(slug)) ??
    `${base}-${crypto.randomUUID().slice(0, 8)}`
  );
}

/** The account's team, created the first time it's needed. */
export async function ensureAccountTeam(userId: string): Promise<AccountTeam> {
  const existing = await findAccountTeam(userId);
  if (existing) return existing;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, username: true },
  });
  const name = user.username ?? user.name;
  try {
    return await prisma.organization.create({
      data: {
        name,
        slug: await freeSlug(teamSlugBase(name)),
        accountOwnerId: userId,
        members: { create: { userId, role: "owner" } },
      },
      select: TEAM,
    });
  } catch (error) {
    // Another request created it at the same moment.
    const team = await findAccountTeam(userId);
    if (team) return team;
    throw error;
  }
}

/**
 * Turns an empty workspace you own into your account's team, members and
 * pending invitations included. For workspaces made before teams existed.
 */
export async function adoptWorkspaceAsTeam(
  userId: string,
  organizationId: string,
): Promise<AccountTeam> {
  if (await findAccountTeam(userId)) {
    throw new ConflictError("You already have a team.");
  }
  const [workspace, user] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        accountOwnerId: true,
        members: { where: { userId }, select: { role: true }, take: 1 },
        _count: { select: { projects: true, subscriptions: true } },
      },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, username: true },
    }),
  ]);
  if (!workspace) throw new NotFoundError("Workspace not found");
  const blocker = adoptionBlocker({
    accountOwnerId: workspace.accountOwnerId,
    projects: workspace._count.projects,
    subscriptions: workspace._count.subscriptions,
    role: workspace.members[0]?.role,
  });
  if (blocker) throw new ConflictError(blocker);
  return prisma.organization.update({
    where: { id: organizationId },
    data: { accountOwnerId: userId, name: user.username ?? user.name },
    select: TEAM,
  });
}

/** The account whose team an invitation is for, so the invitee lands on it after accepting. */
export async function invitationAccount(
  invitationId: string,
): Promise<string | null> {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: {
      organization: {
        select: { accountOwner: { select: { username: true } } },
      },
    },
  });
  return invitation?.organization.accountOwner?.username ?? null;
}

/** Other people's teams you're on, with the account to open. */
export async function teamsJoined(userId: string) {
  const memberships = await prisma.member.findMany({
    where: {
      userId,
      organization: { accountOwnerId: { not: null, notIn: [userId] } },
    },
    select: {
      role: true,
      organization: {
        select: {
          id: true,
          accountOwner: {
            select: { name: true, username: true, image: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return memberships.flatMap(({ role, organization }) =>
    organization.accountOwner?.username
      ? [
          {
            organizationId: organization.id,
            role,
            name: organization.accountOwner.name,
            username: organization.accountOwner.username,
            image: organization.accountOwner.image,
          },
        ]
      : [],
  );
}

/** Dashboards you can open: your own account first, then teams you're on. */
export async function dashboardWorkspaces(
  userId: string,
): Promise<DashboardWorkspace[]> {
  const [user, joined] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, username: true, image: true },
    }),
    teamsJoined(userId),
  ]);
  const own = user?.username
    ? [{ username: user.username, name: user.name, image: user.image }]
    : [];
  return [
    ...own,
    ...joined.map(({ username, name, image, role }) => ({
      username,
      name,
      image,
      role,
    })),
  ];
}

/** The account a dashboard belongs to. */
export function workspaceOwner(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: { name: true, image: true },
  });
}

/** Your workspaces from before teams existed, and whether each could become your team. */
export async function otherWorkspaces(userId: string) {
  const memberships = await prisma.member.findMany({
    where: { userId, organization: { accountOwnerId: null } },
    select: {
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          accountOwnerId: true,
          _count: { select: { projects: true, subscriptions: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map(({ role, organization }) => ({
    id: organization.id,
    name: organization.name,
    role,
    blocker: adoptionBlocker({
      accountOwnerId: organization.accountOwnerId,
      projects: organization._count.projects,
      subscriptions: organization._count.subscriptions,
      role,
    }),
  }));
}
