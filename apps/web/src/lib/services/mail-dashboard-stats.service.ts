import "server-only";
import { prisma } from "@/lib/prisma";
import { visibleMailboxWhere } from "@/lib/services/mail-access.service";

/** Counts over the account's mailboxes that the viewer may see. */
export async function mailDashboardStats(
  ownerId: string,
  viewerId: string,
  projectId?: string,
) {
  const mailbox = {
    userId: ownerId,
    ...(projectId ? { projectId } : {}),
    ...visibleMailboxWhere(viewerId),
  };
  const month = new Date();
  month.setUTCDate(1);
  month.setUTCHours(0, 0, 0, 0);
  const [folders, unreadInbox, sent, received, delivered, opened] =
    await Promise.all([
      prisma.mailMessage.groupBy({
        by: ["folder"],
        where: { mailbox },
        _count: true,
      }),
      prisma.mailMessage.count({
        where: { mailbox, folder: "inbox", isRead: false },
      }),
      prisma.mailMessage.count({
        where: {
          direction: "outbound",
          createdAt: { gte: month },
          mailbox,
        },
      }),
      prisma.mailMessage.count({
        where: {
          direction: "inbound",
          createdAt: { gte: month },
          mailbox,
        },
      }),
      prisma.mailEvent.count({
        where: {
          type: "email.delivered",
          occurredAt: { gte: month },
          message: { mailbox },
        },
      }),
      prisma.mailEvent.count({
        where: {
          type: "email.opened",
          occurredAt: { gte: month },
          message: { mailbox },
        },
      }),
    ]);
  return {
    sent,
    received,
    deliveryRate: sent ? Math.round((delivered / sent) * 10_000) / 100 : 0,
    openRate: delivered ? Math.round((opened / delivered) * 10_000) / 100 : 0,
    folderCounts: {
      ...Object.fromEntries(folders.map((item) => [item.folder, item._count])),
      inbox: unreadInbox,
    },
  };
}
