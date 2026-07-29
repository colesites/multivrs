import "server-only";
import { randomUUID } from "node:crypto";
import { sanitizeOutboundMailHtml } from "@/lib/mail/sanitize-html";
import { prisma } from "@/lib/prisma";
import type { ComposeMailInput } from "@/lib/schemas/mail-message.schemas";
import { ownedMailbox } from "@/lib/services/mail-access.service";
import { enqueueMailWebhooks } from "@/lib/services/mail-webhook-delivery.service";

function normalizeSubject(subject: string): string {
  return subject
    .replace(/^((re|fwd?):\s*)+/i, "")
    .trim()
    .toLowerCase();
}

export async function composeMail(
  userId: string,
  input: ComposeMailInput,
  broadcastId?: string,
) {
  const mailbox = await ownedMailbox(userId, input.mailboxId);
  const reply = input.replyToMessageId
    ? await prisma.mailMessage.findFirst({
        where: { id: input.replyToMessageId, userId },
        select: { messageId: true, references: true, threadId: true },
      })
    : null;
  const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
  const safeHtml = sanitizeOutboundMailHtml(input.html);
  const result = await prisma.$transaction(async (tx) => {
    const thread = reply
      ? await tx.mailThread.findUniqueOrThrow({ where: { id: reply.threadId } })
      : await tx.mailThread.create({
          data: {
            userId,
            mailboxId: mailbox.id,
            subject: input.subject,
            normalizedSubject: normalizeSubject(input.subject),
          },
        });
    const message = await tx.mailMessage.create({
      data: {
        userId,
        mailboxId: mailbox.id,
        threadId: thread.id,
        messageId: `<${randomUUID()}@multivrs.mail>`,
        inReplyTo: reply?.messageId,
        references: reply ? [...reply.references, reply.messageId] : [],
        direction: "outbound",
        status: scheduledAt ? "scheduled" : "queued",
        folder: scheduledAt ? "scheduled" : "sent",
        fromName: mailbox.name,
        fromAddress: mailbox.address,
        toAddresses: input.to,
        ccAddresses: input.cc,
        bccAddresses: input.bcc,
        subject: input.subject,
        textBody: input.text,
        htmlBody: safeHtml,
        sanitizedHtml: safeHtml,
        replyTo: input.replyTo,
        scheduledAt,
      },
    });
    if (input.attachments.length) {
      await tx.mailAttachment.createMany({
        data: input.attachments.map((attachment) => ({
          messageId: message.id,
          filename: attachment.filename,
          contentType: attachment.contentType,
          size: attachment.size,
          storageKey: `database:${message.id}:${attachment.filename}`,
          contentBase64: attachment.contentBase64,
        })),
      });
      await tx.mailMessage.update({
        where: { id: message.id },
        data: { hasAttachments: true },
      });
    }
    const event = await tx.mailEvent.create({
      data: {
        userId,
        messageId: message.id,
        broadcastId,
        type: "email.queued",
        occurredAt: new Date(),
      },
    });
    await tx.mailThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date(), status: "open" },
    });
    return { eventId: event.id, message };
  });
  await enqueueMailWebhooks(result.eventId);
  return result.message;
}
