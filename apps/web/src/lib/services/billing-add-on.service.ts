import "server-only";
import { ConflictError, ValidationError } from "@multivrs/error-utils";
import type Stripe from "stripe";
import type { z } from "zod";
import { getStripe } from "@/lib/payments/stripe-client";
import {
  identifyBillingProduct,
  resolveCatalogPrice,
} from "@/lib/payments/stripe-product-catalog";
import { prisma } from "@/lib/prisma";
import type { updateBillingAddOnSchema } from "@/lib/schemas/billing.schemas";
import {
  requireBillingScope,
  subscriptionScopeWhere,
} from "@/lib/services/billing-scope-access.service";
import { syncBillingSubscription } from "@/lib/services/billing-subscription-sync.service";
import { activeDeveloperSeats } from "@/lib/services/organization-seat.service";

type AddOnInput = z.infer<typeof updateBillingAddOnSchema>;
const ACTIVE = ["active", "trialing", "past_due"];

export async function updateBillingAddOn(
  userId: string,
  input: AddOnInput,
): Promise<void> {
  const access = await requireBillingScope(userId, input.scopeId, true);
  const subscription = await prisma.billingSubscription.findFirst({
    where: { ...subscriptionScopeWhere(access), status: { in: ACTIVE } },
    orderBy: { createdAt: "desc" },
  });
  if (!subscription)
    throw new ConflictError("Upgrade to Pro before adding paid products");
  await validateQuantity(userId, access.organizationId, input);
  const remote = await getStripe().subscriptions.retrieve(
    subscription.stripeSubscriptionId,
    {
      expand: ["items.data.price.product"],
    },
  );
  const current = remote.items.data.find(
    (item) => identifyBillingProduct(item.price).key === input.addOn,
  );
  if (!current && input.quantity === 0) return;
  const items: Stripe.SubscriptionUpdateParams.Item[] = current
    ? [
        {
          deleted: input.quantity === 0,
          id: current.id,
          ...(input.quantity ? { quantity: input.quantity } : {}),
        },
      ]
    : [
        {
          price: (await resolveCatalogPrice(input.addOn)).id,
          quantity: input.quantity,
        },
      ];
  const updated = await getStripe().subscriptions.update(
    remote.id,
    { items, proration_behavior: "always_invoice" },
    { idempotencyKey: input.operationId },
  );
  await syncBillingSubscription(updated, {
    organizationId: access.organizationId ?? undefined,
    userId: access.organizationId ? undefined : userId,
  });
  await prisma.billingSubscriptionItem.updateMany({
    where: {
      billingSubscriptionId: subscription.id,
      productKey: input.addOn,
      active: true,
    },
    data: {
      projectIds:
        input.addOn === "speed_insights" ? unique(input.projectIds) : [],
    },
  });
  await clearUsageBlocks(userId, access.organizationId);
}

async function validateQuantity(
  userId: string,
  organizationId: string | null,
  input: AddOnInput,
): Promise<void> {
  const projectIds = unique(input.projectIds);
  if (
    input.addOn === "speed_insights" &&
    projectIds.length !== input.quantity
  ) {
    throw new ValidationError(
      "Select exactly one project for every Speed Insights unit",
    );
  }
  if (projectIds.length) {
    const projects = await prisma.project.count({
      where: organizationId
        ? { id: { in: projectIds }, organizationId }
        : { id: { in: projectIds }, organizationId: null, ownerId: userId },
    });
    if (projects !== projectIds.length)
      throw new ValidationError(
        "A selected project is outside this billing scope",
      );
  }
  if (input.addOn === "developer_seat" && organizationId) {
    const active = await activeDeveloperSeats(organizationId);
    if (input.quantity + 1 < active) {
      throw new ConflictError(
        `Remove workspace developers before reducing below ${active - 1} additional seats`,
      );
    }
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

async function clearUsageBlocks(
  userId: string,
  organizationId: string | null,
): Promise<void> {
  await prisma.project.updateMany({
    where: organizationId
      ? { organizationId }
      : { organizationId: null, ownerId: userId },
    data: { usageBlockedUntil: null, usageBlockReason: null },
  });
}
