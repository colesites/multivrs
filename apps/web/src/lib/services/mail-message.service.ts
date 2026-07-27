import "server-only";
import { sanitizeMailHtml } from "@/lib/mail/sanitize-html";
import { prisma } from "@/lib/prisma";
import type { InboundMailInput } from "@/lib/schemas/mail-message.schemas";
import { ownedMailMessage } from "@/lib/services/mail-access.service";
import { enqueueMailWebhooks } from "@/lib/services/mail-webhook-delivery.service";

const ACTIONS = {
  archive: { folder: "archive" },
  inbox: { folder: "inbox" },
  read: { isRead: true },
  unread: { isRead: false },
  star: { isStarred: true },
  unstar: { isStarred: false },
  spam: { folder: "spam" },
  trash: { folder: "trash" },
  restore: { folder: "inbox" },
} as const;

export async function updateMailMessage(
  userId: string,
  messageId: string,
  action: keyof typeof ACTIONS,
) {
  await ownedMailMessage(userId, messageId);
  return prisma.mailMessage.update({
    where: { id: messageId },
    data: ACTIONS[action],
  });
}

function normalized(subject: string) {
  return subject
    .replace(/^((re|fwd?):\s*)+/i, "")
    .trim()
    .toLowerCase();
}

export async function receiveMail(input: InboundMailInput) {
  const mailbox = await prisma.mailbox.findFirst({
    where: { address: input.mailbox, status: "active" },
  });
  if (!mailbox) throw new Error("Inbound mailbox not found");
  const existing = await prisma.mailEvent.findFirst({
    where: { userId: mailbox.userId, providerEventId: input.providerEventId },
  });
  if (existing) return { duplicate: true };
  const reply = input.inReplyTo
    ? await prisma.mailMessage.findFirst({
        where: { userId: mailbox.userId, messageId: input.inReplyTo },
      })
    : null;
  const fallback = reply
    ? null
    : await prisma.mailThread.findFirst({
        where: {
          userId: mailbox.userId,
          mailboxId: mailbox.id,
          normalizedSubject: normalized(input.subject),
          messages: { some: { fromAddress: input.from } },
        },
        orderBy: { lastMessageAt: "desc" },
      });
  const result = await prisma.$transaction(async (tx) => {
    const thread =
      reply || fallback
        ? await tx.mailThread.findUniqueOrThrow({
            where: { id: reply?.threadId ?? fallback?.id ?? "" },
          })
        : await tx.mailThread.create({
            data: {
              userId: mailbox.userId,
              mailboxId: mailbox.id,
              subject: input.subject,
              normalizedSubject: normalized(input.subject),
            },
          });
    const message = await tx.mailMessage.create({
      data: {
        userId: mailbox.userId,
        mailboxId: mailbox.id,
        threadId: thread.id,
        messageId: input.messageId,
        inReplyTo: input.inReplyTo,
        references: input.references,
        direction: "inbound",
        status: "received",
        folder: "inbox",
        fromName: input.fromName,
        fromAddress: input.from,
        toAddresses: input.to,
        ccAddresses: input.cc,
        bccAddresses: [],
        subject: input.subject,
        textBody: input.text,
        htmlBody: input.html,
        sanitizedHtml: sanitizeMailHtml(input.html),
        headers: input.headers,
        rawMimeKey: input.rawMimeKey,
        receivedAt: new Date(),
      },
    });
    await tx.mailThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date(), status: "open" },
    });
    const event = await tx.mailEvent.create({
      data: {
        userId: mailbox.userId,
        messageId: message.id,
        type: "email.received",
        providerEventId: input.providerEventId,
        occurredAt: new Date(),
      },
    });
    return { duplicate: false, eventId: event.id, messageId: message.id };
  });
  await enqueueMailWebhooks(result.eventId);
  return { duplicate: false, messageId: result.messageId };
}
