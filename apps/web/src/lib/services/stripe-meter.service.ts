import "server-only";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";
import { logWarning } from "@/lib/services/logger.service";

export type MeterPublishResult = { failed: number; published: number };

export async function publishBillingMeterEvents(
  limit = 100,
): Promise<MeterPublishResult> {
  const events = await pendingEvents(limit);
  const results = await Promise.all(events.map(publishMeterEvent));
  return results.reduce<MeterPublishResult>(
    (total, published) => ({
      failed: total.failed + (published ? 0 : 1),
      published: total.published + (published ? 1 : 0),
    }),
    { failed: 0, published: 0 },
  );
}

async function publishMeterEvent(
  event: Awaited<ReturnType<typeof pendingEvents>>[number],
) {
  try {
    await getStripe().billing.meterEvents.create({
      event_name: event.eventName,
      identifier: event.identifier,
      payload: {
        stripe_customer_id: event.subscription.stripeCustomerId,
        value: event.quantity.toString(),
      },
      timestamp: Math.floor(event.createdAt.getTime() / 1_000),
    });
    await prisma.billingMeterEvent.update({
      where: { id: event.id },
      data: {
        attempts: { increment: 1 },
        lastError: null,
        publishedAt: new Date(),
        status: "published",
      },
    });
    return true;
  } catch (error) {
    await prisma.billingMeterEvent.update({
      where: { id: event.id },
      data: {
        attempts: { increment: 1 },
        lastError:
          error instanceof Error
            ? error.message.slice(0, 500)
            : "Unknown Stripe error",
        status: "failed",
      },
    });
    logWarning("billing.meter.publish_failed", error);
    return false;
  }
}

function pendingEvents(limit: number) {
  return prisma.billingMeterEvent.findMany({
    where: { attempts: { lt: 10 }, status: { in: ["pending", "failed"] } },
    include: { subscription: { select: { stripeCustomerId: true } } },
    orderBy: { createdAt: "asc" },
    take: Math.min(Math.max(limit, 1), 100),
  });
}
