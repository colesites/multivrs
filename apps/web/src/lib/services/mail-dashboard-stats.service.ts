import "server-only";
import { prisma } from "@/lib/prisma";

export async function mailDashboardStats(userId: string, projectId?: string) {
  const scope = projectId ? { projectId } : {};
  const month = new Date();
  month.setUTCDate(1);
  month.setUTCHours(0, 0, 0, 0);
  const [folders, sent, received, delivered, opened] = await Promise.all([
    prisma.mailMessage.groupBy({
      by: ["folder"],
      where: { userId, mailbox: scope },
      _count: true,
    }),
    prisma.mailMessage.count({
      where: {
        userId,
        direction: "outbound",
        createdAt: { gte: month },
        mailbox: scope,
      },
    }),
    prisma.mailMessage.count({
      where: {
        userId,
        direction: "inbound",
        createdAt: { gte: month },
        mailbox: scope,
      },
    }),
    prisma.mailEvent.count({
      where: {
        userId,
        type: "email.delivered",
        occurredAt: { gte: month },
        message: { mailbox: scope },
      },
    }),
    prisma.mailEvent.count({
      where: {
        userId,
        type: "email.opened",
        occurredAt: { gte: month },
        message: { mailbox: scope },
      },
    }),
  ]);
  return {
    sent,
    received,
    deliveryRate: sent ? Math.round((delivered / sent) * 10_000) / 100 : 0,
    openRate: delivered ? Math.round((opened / delivered) * 10_000) / 100 : 0,
    folderCounts: Object.fromEntries(
      folders.map((item) => [item.folder, item._count]),
    ),
  };
}
