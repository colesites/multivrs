import "server-only";
import { prisma } from "@/lib/prisma";
import { visibleMailboxWhere } from "@/lib/services/mail-access.service";

/** The account's mailboxes that the viewer may see. */
export async function mailDashboardPrimary(
  ownerId: string,
  viewerId: string,
  projectId?: string,
) {
  const mailboxes = await prisma.mailbox.findMany({
    where: {
      userId: ownerId,
      ...(projectId ? { projectId } : {}),
      ...visibleMailboxWhere(viewerId),
    },
    select: { id: true, address: true, name: true, kind: true, status: true },
    orderBy: { createdAt: "asc" },
  });
  return {
    mailboxes,
    activeMailboxes: mailboxes.filter((item) => item.status === "active")
      .length,
  };
}
