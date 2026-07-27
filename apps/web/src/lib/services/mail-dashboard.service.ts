import "server-only";
import type { MailDashboardData } from "@/features/mail/mail.types";
import { mailDashboardPrimary } from "@/lib/services/mail-dashboard-primary.service";
import { mailDashboardResources } from "@/lib/services/mail-dashboard-resources.service";
import { mailDashboardStats } from "@/lib/services/mail-dashboard-stats.service";

export async function mailDashboard(
  userId: string,
  projectId?: string,
): Promise<MailDashboardData> {
  const [primary, stats, resourceData] = await Promise.all([
    mailDashboardPrimary(userId, projectId),
    mailDashboardStats(userId, projectId),
    mailDashboardResources(userId, projectId),
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
