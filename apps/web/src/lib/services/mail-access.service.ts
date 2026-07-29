import "server-only";
import { NotFoundError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";

export async function assertMailProject(
  userId: string,
  projectId?: string,
): Promise<void> {
  if (!projectId) return;
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) throw new NotFoundError("Project not found");
}

export async function ownedMailbox(userId: string, mailboxId: string) {
  const mailbox = await prisma.mailbox.findFirst({
    where: {
      id: mailboxId,
      OR: [{ userId }, { members: { some: { userId } } }],
    },
    include: { domain: true },
  });
  if (!mailbox) throw new NotFoundError("Mailbox not found");
  return mailbox;
}

export async function ownedMailMessage(userId: string, messageId: string) {
  const message = await prisma.mailMessage.findFirst({
    where: { id: messageId, userId },
  });
  if (!message) throw new NotFoundError("Message not found");
  return message;
}
