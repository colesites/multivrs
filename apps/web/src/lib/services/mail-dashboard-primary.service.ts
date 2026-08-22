import "server-only";

import type { MailMessageDetail } from "@/features/mail/mail.types";
import { prisma } from "@/lib/prisma";
import { mapMessage, mapThread } from "@/lib/services/mail-dashboard-mappers";

export async function mailDashboardPrimary(userId: string, projectId?: string) {
  const scope = projectId ? { projectId } : {};
  const [mailboxes, threads, messages] = await Promise.all([
    prisma.mailbox.findMany({
      where: { userId, ...scope },
      orderBy: { createdAt: "asc" },
    }),
    prisma.mailThread.findMany({
      where: { userId, mailbox: scope },
      include: {
        assignedTo: { select: { name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 100,
    }),
    prisma.mailMessage.findMany({
      where: { userId, mailbox: scope },
      include: { attachments: true },
      orderBy: { createdAt: "asc" },
      take: 500,
    }),
  ]);
  const grouped: Record<string, MailMessageDetail[]> = {};
  for (const row of messages) {
    const [threadId, mapped] = mapMessage(row);
    const threadMessages = grouped[threadId] ?? [];
    threadMessages.push(mapped);
    grouped[threadId] = threadMessages;
  }
  return {
    mailboxes: mailboxes.map(({ id, address, name, kind, status }) => ({
      id,
      address,
      name,
      kind,
      status,
    })),
    activeMailboxes: mailboxes.filter((item) => item.status === "active")
      .length,
    threads: threads.map(mapThread),
    messages: grouped,
  };
}
