import "server-only";
import { createHmac } from "node:crypto";
import { mailWebhookSecret } from "@/lib/mail/mail-webhook-secret";
import { prisma } from "@/lib/prisma";

export async function enqueueMailWebhooks(eventId: string) {
  const event = await prisma.mailEvent.findUnique({
    where: { id: eventId },
    include: { message: { include: { mailbox: true } }, broadcast: true },
  });
  if (!event) return;
  const projectId =
    event.message?.mailbox.projectId ?? event.broadcast?.projectId;
  const endpoints = await prisma.mailWebhookEndpoint.findMany({
    where: {
      userId: event.userId,
      enabled: true,
      events: { has: event.type },
      OR: [{ projectId: null }, ...(projectId ? [{ projectId }] : [])],
    },
    select: { id: true },
  });
  if (endpoints.length) {
    await prisma.mailWebhookDelivery.createMany({
      data: endpoints.map((endpoint) => ({ endpointId: endpoint.id, eventId })),
      skipDuplicates: true,
    });
  }
}

async function deliver(id: string) {
  const delivery = await prisma.mailWebhookDelivery.findUnique({
    where: { id },
    include: { endpoint: true },
  });
  if (!delivery?.endpoint.enabled) return;
  const event = await prisma.mailEvent.findUnique({
    where: { id: delivery.eventId },
  });
  if (!event) return;
  const body = JSON.stringify({
    id: event.id,
    type: event.type,
    createdAt: event.occurredAt.toISOString(),
    data: event.payload ?? {},
  });
  const timestamp = Math.floor(Date.now() / 1_000).toString();
  const signature = createHmac("sha256", mailWebhookSecret(delivery.endpointId))
    .update(`${timestamp}.${body}`)
    .digest("hex");
  let responseCode: number | undefined;
  let error: string | undefined;
  try {
    const response = await fetch(delivery.endpoint.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-multivrs-event": event.id,
        "x-multivrs-timestamp": timestamp,
        "x-multivrs-signature": signature,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    responseCode = response.status;
    if (!response.ok) error = `Endpoint returned ${response.status}`;
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "Webhook delivery failed";
  }
  const attempts = delivery.attempts + 1;
  const delivered = !error;
  const exhausted = attempts >= 10;
  await prisma.mailWebhookDelivery.update({
    where: { id: delivery.id },
    data: {
      attempts,
      responseCode,
      error: error?.slice(0, 1_000),
      status: delivered ? "delivered" : exhausted ? "dead" : "failed",
      nextAttemptAt:
        delivered || exhausted
          ? null
          : new Date(Date.now() + Math.min(3_600, 2 ** attempts * 15) * 1_000),
    },
  });
}

export async function deliverWebhookBatch() {
  const due = await prisma.mailWebhookDelivery.findMany({
    where: {
      OR: [
        { status: "pending" },
        { status: "failed", nextAttemptAt: { lte: new Date() } },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
    take: 100,
  });
  await Promise.all(due.map((row) => deliver(row.id)));
  return due.length;
}
