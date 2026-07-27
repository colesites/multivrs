import "server-only";
import { prisma } from "@/lib/prisma";
import type { MailProviderEventInput } from "@/lib/schemas/mail-provider.schemas";
import { enqueueMailWebhooks } from "@/lib/services/mail-webhook-delivery.service";

const statusByType = {
  delivered: "delivered",
  opened: "delivered",
  clicked: "delivered",
  bounced: "bounced",
  complained: "complained",
  deferred: "deferred",
} as const;

export async function recordProviderEvent(input: MailProviderEventInput) {
  const message = await prisma.mailMessage.findFirst({
    where: { providerMessageId: input.providerMessageId },
    select: { id: true, userId: true },
  });
  if (!message) return { accepted: true, matched: false };
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
  const event = await prisma.$transaction(async (tx) => {
    const savedEvent = await tx.mailEvent.upsert({
      where: {
        userId_providerEventId: {
          userId: message.userId,
          providerEventId: input.providerEventId,
        },
      },
      create: {
        userId: message.userId,
        messageId: message.id,
        providerEventId: input.providerEventId,
        type: `email.${input.type}`,
        payload: input.payload,
        occurredAt,
      },
      update: {},
    });
    await tx.mailMessage.update({
      where: { id: message.id },
      data: { status: statusByType[input.type] },
    });
    return savedEvent;
  });
  await enqueueMailWebhooks(event.id);
  return { accepted: true, matched: true };
}
