import "server-only";
import { prisma } from "@/lib/prisma";
import { assertMailProject } from "@/lib/services/mail-access.service";

export async function emptyMailTrash(userId: string, projectId?: string) {
  await assertMailProject(userId, projectId);
  const scope = projectId ? { projectId } : {};
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.mailMessage.deleteMany({
      where: { userId, folder: "trash", mailbox: scope },
    });
    await tx.mailThread.deleteMany({
      where: { userId, mailbox: scope, messages: { none: {} } },
    });
    return { deleted: deleted.count };
  });
}
