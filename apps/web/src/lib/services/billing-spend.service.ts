import "server-only";
import { ConflictError } from "@multivrs/error-utils";
import type { z } from "zod";
import { getStripe } from "@/lib/payments/stripe-client";
import {
  identifyBillingProduct,
  resolveCatalogPrice,
} from "@/lib/payments/stripe-product-catalog";
import { prisma } from "@/lib/prisma";
import type { updateSpendPolicySchema } from "@/lib/schemas/billing.schemas";
import {
  requireBillingScope,
  subscriptionScopeWhere,
} from "@/lib/services/billing-scope-access.service";
import { syncBillingSubscription } from "@/lib/services/billing-subscription-sync.service";

type SpendInput = z.infer<typeof updateSpendPolicySchema>;
const ACTIVE = ["active", "trialing", "past_due"];

export async function updateBillingSpendPolicy(
  userId: string,
  input: SpendInput,
): Promise<void> {
  const access = await requireBillingScope(userId, input.scopeId, true);
  const subscription = await prisma.billingSubscription.findFirst({
    where: { ...subscriptionScopeWhere(access), status: { in: ACTIVE } },
    orderBy: { createdAt: "desc" },
  });
  if (!subscription)
    throw new ConflictError("Paid overages require an active Pro subscription");
  if (input.overagesEnabled) {
    const remote = await ensureUsageMeters(
      subscription.stripeSubscriptionId,
      input.operationId,
    );
    await syncBillingSubscription(remote, {
      organizationId: access.organizationId ?? undefined,
      userId: access.organizationId ? undefined : userId,
    });
  }
  await prisma.billingSubscription.update({
    where: { id: subscription.id },
    data: {
      overagesEnabled: input.overagesEnabled,
      spendAlertCents: input.spendAlertCents,
      spendLimitCents: input.spendLimitCents,
    },
  });
  await prisma.project.updateMany({
    where: access.organizationId
      ? { organizationId: access.organizationId }
      : { organizationId: null, ownerId: userId },
    data: { usageBlockedUntil: null, usageBlockReason: null },
  });
}

async function ensureUsageMeters(
  subscriptionId: string,
  idempotencyKey: string,
) {
  const remote = await getStripe().subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product"],
  });
  const existing = new Set(
    remote.items.data.map((item) => identifyBillingProduct(item.price).key),
  );
  const missing = (["mail_email_units", "usage_overage_cents"] as const).filter(
    (key) => !existing.has(key),
  );
  if (!missing.length) return remote;
  const prices = await Promise.all(missing.map(resolveCatalogPrice));
  return getStripe().subscriptions.update(
    subscriptionId,
    {
      items: prices.map((price) => ({ price: price.id })),
      proration_behavior: "none",
    },
    { idempotencyKey },
  );
}
