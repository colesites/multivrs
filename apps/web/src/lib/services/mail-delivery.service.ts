import "server-only";
import { isAuthenticatedSendingDomain } from "@/lib/mail/mail-domain-dns";
import { configuredMailProvider } from "@/lib/mail/resend-mail.provider";
import { prisma } from "@/lib/prisma";
import { enqueueMailWebhooks } from "@/lib/services/mail-webhook-delivery.service";

export async function deliverMailMessage(userId: string, messageId: string) {
  const message = await prisma.mailMessage.findFirst({
    where: { id: messageId, userId, status: { in: ["queued", "processing"] } },
    include: {
      attachments: true,
      mailbox: { include: { domain: true } },
    },
  });
  if (!message) return;
  const suppressed = await prisma.mailSuppression.findFirst({
    where: { userId, email: { in: message.toAddresses } },
  });
  if (suppressed) {
    await markFailed(message.id, userId, "A recipient is suppressed");
    return;
  }
  if (!isAuthenticatedSendingDomain(message.mailbox.domain)) {
    await markFailed(
      message.id,
      userId,
      "The sending domain is not authenticated with the delivery provider",
    );
    return;
  }
  await prisma.mailMessage.update({
    where: { id: message.id },
    data: { status: "processing" },
  });
  try {
    const result = await configuredMailProvider().send({
      from: message.fromName
        ? `${message.fromName} <${message.fromAddress}>`
        : message.fromAddress,
      to: message.toAddresses,
      cc: message.ccAddresses,
      bcc: message.bccAddresses,
      replyTo: message.replyTo ?? undefined,
      subject: message.subject,
      text: message.textBody ?? undefined,
      html: message.htmlBody ?? undefined,
      headers: { "Message-ID": message.messageId },
      attachments: message.attachments.flatMap((attachment) =>
        attachment.contentBase64
          ? [
              {
                filename: attachment.filename,
                contentType: attachment.contentType,
                content: Buffer.from(attachment.contentBase64, "base64"),
              },
            ]
          : [],
      ),
    });
    const event = await prisma.$transaction(async (tx) => {
      await tx.mailMessage.update({
        where: { id: message.id },
        data: {
          status: "sent",
          providerMessageId: result.providerMessageId,
          sentAt: new Date(),
        },
      });
      return tx.mailEvent.create({
        data: {
          userId,
          messageId: message.id,
          type: "email.sent",
          payload: { provider: result.provider },
          occurredAt: new Date(),
        },
      });
    });
    await enqueueMailWebhooks(event.id);
  } catch (error) {
    await markFailed(
      message.id,
      userId,
      error instanceof Error ? error.message : "Outbound provider failed",
    );
  }
}

async function markFailed(messageId: string, userId: string, reason: string) {
  const event = await prisma.$transaction(async (tx) => {
    await tx.mailMessage.update({
      where: { id: messageId },
      data: { status: "failed" },
    });
    return tx.mailEvent.create({
      data: {
        userId,
        messageId,
        type: "email.failed",
        payload: { reason },
        occurredAt: new Date(),
      },
    });
  });
  await enqueueMailWebhooks(event.id);
}
