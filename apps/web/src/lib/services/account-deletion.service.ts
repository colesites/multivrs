import "server-only";
import type { AccountDeletionBlocker } from "@/features/dashboard/types/account-security.types";
import { prisma } from "@/lib/prisma";

/** Subscriptions Stripe may still charge for. */
const BILLABLE = ["active", "trialing", "past_due", "unpaid"];

/**
 * Deleting a user cascades through the database, but projects, domains, mail
 * domains and paid plans also live with Cloudflare, the registrar, SES and
 * Stripe. Those are removed through their own flows first, so nothing is left
 * running or billing with no account behind it.
 */
export async function accountDeletionBlockers(
  userId: string,
): Promise<AccountDeletionBlocker[]> {
  const [user, subscription, projects, domains, mailDomains, workspaces] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      }),
      prisma.billingSubscription.findFirst({
        where: { userId, organizationId: null, status: { in: BILLABLE } },
        select: { id: true },
      }),
      prisma.project.count({ where: { ownerId: userId } }),
      prisma.domain.count({ where: { userId } }),
      prisma.mailDomain.count({ where: { userId } }),
      // Older workspaces you alone own while others are still in them.
      prisma.organization.findMany({
        where: {
          accountOwnerId: null,
          members: { some: { userId, role: "owner" } },
        },
        select: {
          name: true,
          members: { select: { userId: true, role: true } },
        },
      }),
    ]);
  const base = `/${user?.username ?? ""}`;
  const blockers: AccountDeletionBlocker[] = [];
  if (subscription) {
    blockers.push({
      message: "Cancel your paid plan.",
      href: `${base}/~/settings#billing`,
    });
  }
  if (projects > 0) {
    blockers.push({
      message: `Delete your ${plural(projects, "project")}.`,
      href: base,
    });
  }
  if (domains > 0) {
    blockers.push({
      message: `Remove your ${plural(domains, "domain")}.`,
      href: `${base}/~/domains`,
    });
  }
  if (mailDomains > 0) {
    blockers.push({
      message: `Delete your ${plural(mailDomains, "mail domain")}.`,
      href: `${base}/~/emails?view=domains`,
    });
  }
  for (const workspace of workspaces) {
    const otherOwners = workspace.members.some(
      (member) => member.userId !== userId && member.role === "owner",
    );
    const others = workspace.members.some((member) => member.userId !== userId);
    if (others && !otherOwners) {
      blockers.push({
        message: `Make someone else an owner of ${workspace.name}.`,
        href: `${base}/~/settings#team`,
      });
    }
  }
  return blockers;
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
