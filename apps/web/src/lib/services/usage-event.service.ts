import "server-only";
import { ConflictError } from "@multivrs/error-utils";
import type { Prisma } from "@prisma/client";
import { METER_CATALOG } from "@/lib/payments/billing.catalog";
import { prisma } from "@/lib/prisma";
import { resolveBillingEntitlements } from "@/lib/services/billing-entitlement.service";
import { logWarning } from "@/lib/services/logger.service";
import { createNotification } from "@/lib/services/notification.service";
import { publishBillingMeterEvents } from "@/lib/services/stripe-meter.service";
import { createUsageTransaction } from "@/lib/services/usage-event-transaction.service";

export async function recordUsageEvent(
  userId: string | null,
  projectId: string | null,
  metric: string,
  quantity: bigint | number = 1,
  metadata?: Prisma.InputJsonValue,
  options: {
    deferMeterPublication?: boolean;
    idempotencyKey?: string;
  } = {},
): Promise<string> {
  const measured = BigInt(quantity);
  if (measured < 0n)
    throw new ConflictError("Usage quantity cannot be negative");
  const entitlements = await resolveBillingEntitlements(
    userId ?? "",
    projectId,
  );
  const definition = METER_CATALOG[metric];
  const billingScopeKey =
    definition?.projectScoped && projectId
      ? `${entitlements.scopeKey}:project:${projectId}`
      : entitlements.scopeKey;
  if (options.idempotencyKey) {
    const existing = await prisma.usageEvent.findUnique({
      where: { idempotencyKey: options.idempotencyKey },
      select: { id: true },
    });
    if (existing) return existing.id;
  }
  const createdMeter = await createUsageTransaction({
    billingScopeKey,
    entitlements,
    idempotencyKey: options.idempotencyKey,
    metadata,
    metric,
    projectId,
    quantity: measured,
    userId,
  });
  if (createdMeter.spendAlertCents !== null && userId) {
    void createNotification({
      message: `Estimated metered usage has reached $${(createdMeter.spendAlertCents / 100).toFixed(2)} this billing period.`,
      title: "Usage spend alert reached",
      type: "warning",
      userId,
    }).catch((error) => logWarning("billing.spend_alert.failed", error));
  }
  if (createdMeter.metered && !options.deferMeterPublication) {
    void publishBillingMeterEvents(10).catch((error) =>
      logWarning("billing.meter.publish_deferred", error),
    );
  }
  return createdMeter.eventId;
}

export async function releaseUsageReservation(eventId: string): Promise<void> {
  const event = await prisma.usageEvent.findUnique({
    where: { id: eventId },
    include: { billingEvent: { select: { status: true } } },
  });
  if (event?.billingEvent?.status === "published") return;
  await prisma.usageEvent.deleteMany({ where: { id: eventId } });
}
