import { ConflictError } from "@multivrs/error-utils";
import type { Prisma } from "@prisma/client";
import { METER_CATALOG } from "@/lib/payments/billing.catalog";
import { decideUsage } from "@/lib/payments/billing-calculation";
import { prisma } from "@/lib/prisma";
import type { BillingEntitlements } from "@/lib/services/billing-entitlement.service";

type UsageTransactionInput = {
  billingScopeKey: string;
  entitlements: BillingEntitlements;
  idempotencyKey?: string;
  metadata?: Prisma.InputJsonValue;
  metric: string;
  projectId: string | null;
  quantity: bigint;
  userId: string | null;
};

export type UsageTransactionResult = {
  eventId: string;
  metered: boolean;
  spendAlertCents: number | null;
};

export function createUsageTransaction(
  input: UsageTransactionInput,
): Promise<UsageTransactionResult> {
  return prisma.$transaction(async (tx) => {
    const { entitlements } = input;
    const [usage, spend] = await Promise.all([
      tx.usageEvent.aggregate({
        where: {
          billingScopeKey: input.billingScopeKey,
          metric: input.metric,
          occurredAt: {
            gte: entitlements.currentPeriodStart,
            lt: entitlements.currentPeriodEnd,
          },
        },
        _sum: { quantity: true },
      }),
      entitlements.subscriptionId
        ? tx.billingMeterEvent.aggregate({
            where: {
              billingSubscriptionId: entitlements.subscriptionId,
              createdAt: {
                gte: entitlements.currentPeriodStart,
                lt: entitlements.currentPeriodEnd,
              },
            },
            _sum: { estimatedCostCents: true },
          })
        : null,
    ]);
    const currentSpend = spend?._sum.estimatedCostCents ?? 0;
    const decision = decideUsage({
      context: entitlements.context,
      currentEstimatedCostCents: currentSpend,
      metric: input.metric,
      quantity: input.quantity,
      used: usage._sum.quantity ?? 0n,
    });
    if (!decision.allowed) {
      throw new ConflictError(decision.reason ?? "Usage limit reached");
    }
    const event = await tx.usageEvent.create({
      data: {
        billingScopeKey: input.billingScopeKey,
        billingSubscriptionId: entitlements.subscriptionId,
        idempotencyKey: input.idempotencyKey,
        metadata: input.metadata,
        metric: input.metric,
        overageQuantity: decision.overageDelta,
        projectId: input.projectId,
        quantity: input.quantity,
        userId: input.userId,
      },
    });
    const alert = alertCrossed(
      entitlements.spendAlertCents,
      currentSpend,
      decision.estimatedCostDeltaCents,
    );
    const definition = METER_CATALOG[input.metric];
    if (
      !entitlements.subscriptionId ||
      !definition ||
      decision.overageDelta === 0n ||
      (input.metric !== "mail_email_units" &&
        decision.estimatedCostDeltaCents === 0)
    ) {
      return { eventId: event.id, metered: false, spendAlertCents: alert };
    }
    await tx.billingMeterEvent.create({
      data: {
        billingSubscriptionId: entitlements.subscriptionId,
        estimatedCostCents: decision.estimatedCostDeltaCents,
        eventName:
          input.metric === "mail_email_units"
            ? definition.eventName
            : "multivrs_usage_overage_cents",
        identifier: event.id,
        quantity:
          input.metric === "mail_email_units"
            ? decision.overageDelta
            : BigInt(decision.estimatedCostDeltaCents),
        usageEventId: event.id,
      },
    });
    return { eventId: event.id, metered: true, spendAlertCents: alert };
  });
}

function alertCrossed(
  threshold: number | null,
  current: number,
  delta: number,
): number | null {
  return threshold !== null &&
    current < threshold &&
    current + delta >= threshold
    ? threshold
    : null;
}
