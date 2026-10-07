import "server-only";
import { ForbiddenError, NotFoundError } from "@multivrs/error-utils";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type AccountAction,
  accountRole,
  accountRoleSelect,
  canAccount,
  ownedOrTeamWhere,
} from "@/lib/services/account-access";
import {
  projectAccessWhere,
  projectRole,
  projectRoleInclude,
} from "@/lib/services/project-access";

/**
 * Mail belongs to an account. People on the account's team work with it
 * by their role, and a mailbox's kind decides who sees it: a personal
 * mailbox only its members (the person who made it), any other kind the
 * whole team.
 */
export interface MailAccount {
  /** The account the mail belongs to; stored as `userId` on mail rows. */
  ownerId: string;
  /** The actor's role there: "owner" on their own account. */
  role: string;
}

/** Where a request says it's working: a project, or an account by username. */
export interface MailTarget {
  projectId?: string;
  account?: string;
}

function allowed(role: string | undefined, action: AccountAction): string {
  if (!role) throw new NotFoundError("Not found");
  if (!canAccount(role, action)) {
    throw new ForbiddenError("Your team role can't do this");
  }
  return role;
}

/**
 * The account a mail request works in: the project's account when it names
 * a project, else the account it names, else the actor's own.
 */
export async function mailAccount(
  actorId: string,
  target: MailTarget,
  action: AccountAction = "manage",
): Promise<MailAccount> {
  if (target.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: target.projectId, OR: projectAccessWhere(actorId) },
      include: projectRoleInclude(actorId),
    });
    if (!project) throw new NotFoundError("Project not found");
    const role = project.ownerId === actorId ? "owner" : projectRole(project);
    return { ownerId: project.ownerId, role: allowed(role, action) };
  }
  if (target.account) {
    const owner = await prisma.user.findUnique({
      where: { username: target.account },
      select: { id: true, ...accountRoleSelect(actorId) },
    });
    if (owner && owner.id !== actorId) {
      const role = owner.accountTeam?.members[0]?.role;
      return { ownerId: owner.id, role: allowed(role, action) };
    }
  }
  return { ownerId: actorId, role: "owner" };
}

/** Mailboxes `viewerId` may see within an account. */
export function visibleMailboxWhere(
  viewerId: string,
): Prisma.MailboxWhereInput {
  return {
    OR: [
      { kind: { not: "personal" } },
      { members: { some: { userId: viewerId } } },
    ],
  };
}

/** Mailboxes `viewerId` may see in any account they're on. */
function reachableMailboxWhere(viewerId: string): Prisma.MailboxWhereInput {
  return {
    AND: [{ OR: ownedOrTeamWhere(viewerId) }, visibleMailboxWhere(viewerId)],
  };
}

/**
 * A mailbox to act on. People need to see it and have a role allowing
 * `action`; `asAccount` is for the account itself (API keys, scheduled
 * broadcasts), which may use any of its mailboxes.
 */
export async function accessibleMailbox(
  actorId: string,
  mailboxId: string,
  action: AccountAction = "manage",
  asAccount = false,
) {
  const mailbox = await prisma.mailbox.findFirst({
    where: asAccount
      ? { id: mailboxId, userId: actorId }
      : { id: mailboxId, ...reachableMailboxWhere(actorId) },
    include: { domain: true, user: { select: accountRoleSelect(actorId) } },
  });
  if (!mailbox) throw new NotFoundError("Mailbox not found");
  if (!asAccount) allowed(accountRole(actorId, mailbox), action);
  return mailbox;
}

/** A message in a mailbox the actor can see, if their role allows `action`. */
export async function accessibleMailMessage(
  actorId: string,
  messageId: string,
  action: AccountAction,
) {
  const message = await prisma.mailMessage.findFirst({
    where: { id: messageId, mailbox: reachableMailboxWhere(actorId) },
    include: {
      mailbox: {
        select: { userId: true, user: { select: accountRoleSelect(actorId) } },
      },
    },
  });
  if (!message) throw new NotFoundError("Message not found");
  allowed(accountRole(actorId, message.mailbox), action);
  return message;
}
