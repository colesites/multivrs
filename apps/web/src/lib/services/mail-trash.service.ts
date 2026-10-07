import "server-only";
import { prisma } from "@/lib/prisma";
import {
  type MailTarget,
  mailAccount,
  visibleMailboxWhere,
} from "@/lib/services/mail-access.service";

/** Deletes Trash in the mailboxes the actor can see in the account. */
export async function emptyMailTrash(actorId: string, target: MailTarget) {
  const { ownerId } = await mailAccount(actorId, target);
  const mailbox = {
    userId: ownerId,
    ...(target.projectId ? { projectId: target.projectId } : {}),
    ...visibleMailboxWhere(actorId),
  };
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.mailMessage.deleteMany({
      where: { folder: "trash", mailbox },
    });
    await tx.mailThread.deleteMany({
      where: { mailbox, messages: { none: {} } },
    });
    return { deleted: deleted.count };
  });
}
