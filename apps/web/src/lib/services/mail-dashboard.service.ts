import "server-only";
import type { MailDashboardData } from "@/features/mail/mail.types";
import { mailDashboardPrimary } from "@/lib/services/mail-dashboard-primary.service";
import { mailDashboardResources } from "@/lib/services/mail-dashboard-resources.service";
import { mailDashboardStats } from "@/lib/services/mail-dashboard-stats.service";

/**
 * The mail of the account `ownerId` as `viewerId` sees it: every shared
 * resource, and only the mailboxes (with their mail) they may see.
 */
export async function mailDashboard(
  ownerId: string,
  viewerId: string,
  projectId?: string,
): Promise<MailDashboardData> {
  const [primary, stats, resourceData] = await Promise.all([
    mailDashboardPrimary(ownerId, viewerId, projectId),
    mailDashboardStats(ownerId, viewerId, projectId),
    mailDashboardResources(ownerId, projectId),
  ]);
  return {
    stats: {
      sent: stats.sent,
      received: stats.received,
      deliveryRate: stats.deliveryRate,
      openRate: stats.openRate,
      activeMailboxes: primary.activeMailboxes,
      verifiedDomains: resourceData.verifiedDomains,
    },
    folderCounts: stats.folderCounts,
    mailboxes: primary.mailboxes,
    threads: primary.threads,
    messages: primary.messages,
    resources: resourceData.resources,
  };
}
