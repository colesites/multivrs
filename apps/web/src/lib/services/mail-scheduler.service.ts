import "server-only";
import { prisma } from "@/lib/prisma";
import { composeMail } from "@/lib/services/mail-compose.service";

export interface ScheduledMailJob {
  userId: string;
  messageId: string;
}

async function materializeBroadcast(
  broadcast: Awaited<ReturnType<typeof dueBroadcasts>>[number],
) {
  const mailbox = await prisma.mailbox.findFirst({
    where: {
      userId: broadcast.userId,
      address: broadcast.fromAddress,
      status: "active",
    },
  });
  if (!mailbox || !broadcast.audience)
    throw new Error("Broadcast sender or audience is unavailable");
  const suppressed = new Set(
    (
      await prisma.mailSuppression.findMany({
        where: { userId: broadcast.userId },
        select: { email: true },
      })
    ).map((row) => row.email),
  );
  const content = broadcast.templateVersion;
  const recipients = broadcast.audience.members.filter(
    (member) =>
      member.subscriptionState === "subscribed" &&
      !suppressed.has(member.contact.email),
  );
  const messages = await Promise.all(
    recipients.map((member) =>
      composeMail(
        broadcast.userId,
        {
          mailboxId: mailbox.id,
          to: [member.contact.email],
          cc: [],
          bcc: [],
          subject: broadcast.subject,
          text: content?.text ?? "",
          html: content?.html,
        },
        broadcast.id,
      ),
    ),
  );
  await prisma.mailBroadcast.update({
    where: { id: broadcast.id },
    data: { status: "sending", sentAt: new Date() },
  });
  return messages.map((message) => ({
    userId: broadcast.userId,
    messageId: message.id,
  }));
}

function dueBroadcasts() {
  return prisma.mailBroadcast.findMany({
    where: { status: "scheduled", scheduledAt: { lte: new Date() } },
    include: {
      audience: { include: { members: { include: { contact: true } } } },
      templateVersion: true,
    },
    take: 25,
  });
}

export async function prepareDueMailJobs(): Promise<ScheduledMailJob[]> {
  const broadcasts = await Promise.all(
    (await dueBroadcasts()).map(async (broadcast) => {
      const claimed = await prisma.mailBroadcast.updateMany({
        where: { id: broadcast.id, status: "scheduled" },
        data: { status: "processing" },
      });
      if (!claimed.count) return [];
      try {
        return await materializeBroadcast(broadcast);
      } catch (error) {
        await prisma.mailBroadcast.update({
          where: { id: broadcast.id },
          data: {
            status: "failed",
            stats: {
              error:
                error instanceof Error ? error.message : "Broadcast failed",
            },
          },
        });
        return [];
      }
    }),
  );
  const scheduled = await prisma.mailMessage.findMany({
    where: { status: "scheduled", scheduledAt: { lte: new Date() } },
    select: { id: true, userId: true },
    take: 500,
  });
  const scheduledJobs = await Promise.all(
    scheduled.map(async (message) => {
      const claimed = await prisma.mailMessage.updateMany({
        where: { id: message.id, status: "scheduled" },
        data: { status: "queued" },
      });
      return claimed.count
        ? { userId: message.userId, messageId: message.id }
        : null;
    }),
  );
  return [...broadcasts.flat(), ...scheduledJobs.filter((job) => job !== null)];
}
