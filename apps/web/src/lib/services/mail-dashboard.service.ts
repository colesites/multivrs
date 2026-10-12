import "server-only";
import type {
  MailDashboardData,
  MailResources,
} from "@/features/mail/mail.types";
import { prisma } from "@/lib/prisma";
import { mailDashboardPrimary } from "@/lib/services/mail-dashboard-primary.service";
import { mailDashboardResources } from "@/lib/services/mail-dashboard-resources.service";
import { mailDashboardStats } from "@/lib/services/mail-dashboard-stats.service";
import { listMailThreads } from "@/lib/services/mail-threads.service";

/**
 * What every mail page shares, for the account `ownerId` as `viewerId` sees
 * it: counts, the mailboxes they may see, and the latest few conversations.
 * Resource lists, folder lists and message bodies load separately.
 */
export async function mailDashboard(
  ownerId: string,
  viewerId: string,
  projectId?: string,
): Promise<MailDashboardData> {
  const scope = projectId ? { projectId } : {};
  const [primary, stats, recent, verifiedDomains, contacts] = await Promise.all(
    [
      mailDashboardPrimary(ownerId, viewerId, projectId),
      mailDashboardStats(ownerId, viewerId, projectId),
      listMailThreads(
        { ownerId, viewerId, projectId },
        { view: "recent", limit: 5 },
      ),
      // Matches isAuthenticatedSendingDomain.
      prisma.mailDomain.count({
        where: {
          userId: ownerId,
          ...scope,
          status: "verified",
          provider: "ses",
          providerDomainId: { not: null },
        },
      }),
      prisma.mailContact.count({ where: { userId: ownerId } }),
    ],
  );
  return {
    stats: {
      sent: stats.sent,
      received: stats.received,
      deliveryRate: stats.deliveryRate,
      openRate: stats.openRate,
      activeMailboxes: primary.activeMailboxes,
      verifiedDomains,
      contacts,
    },
    folderCounts: stats.folderCounts,
    mailboxes: primary.mailboxes,
    recentThreads: recent.threads,
  };
}

/** The account's resource lists, for the resource pages. */
export async function mailResources(
  ownerId: string,
  projectId?: string,
): Promise<MailResources> {
  return (await mailDashboardResources(ownerId, projectId)).resources;
}
