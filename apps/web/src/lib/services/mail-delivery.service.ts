import "server-only";
import { isAuthenticatedSendingDomain } from "@/lib/mail/mail-domain-dns";
import { configuredMailProvider } from "@/lib/mail/ses-mail.provider";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/services/logger.service";
import { enqueueMailWebhooks } from "@/lib/services/mail-webhook-delivery.service";
import { publishBillingMeterEvents } from "@/lib/services/stripe-meter.service";
import {
  recordUsageEvent,
  releaseUsageReservation,
} from "@/lib/services/usage-event.service";

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
  let usageReservation: string | null = null;
  let providerAccepted = false;
  try {
    const recipients =
      message.toAddresses.length +
      message.ccAddresses.length +
      message.bccAddresses.length;
    usageReservation = await recordUsageEvent(
      userId,
      message.mailbox.projectId,
      "mail_email_units",
      recipients,
      { messageId: message.id },
      {
        deferMeterPublication: true,
        idempotencyKey: `mail:outbound:${message.id}`,
      },
    );
    const result = await configuredMailProvider(userId).send({

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
    providerAccepted = true;
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
    await publishBillingMeterEvents(10);
  } catch (error) {
    if (usageReservation && !providerAccepted) {
      await releaseUsageReservation(usageReservation);
    }
    logError("mail.delivery.failed", error, { messageId: message.id, userId });
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
