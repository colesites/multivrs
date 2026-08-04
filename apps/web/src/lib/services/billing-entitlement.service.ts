import "server-only";
import { ConflictError } from "@multivrs/error-utils";
import type {
  AddOnKey,
  EntitlementContext,
  ResourceKey,
} from "@/lib/payments/billing.types";
import { hasAddOn, resourceLimit } from "@/lib/payments/billing-calculation";
import { prisma } from "@/lib/prisma";
import {
  addOnState,
  parseEntitlementOverrides,
  parseRateOverrides,
  periodFallback,
  planKey,
  projectBillingScope,
} from "@/lib/services/billing-entitlement.helpers";
import { isBillingScopeWhitelisted } from "@/lib/services/billing-entitlement-whitelist.service";

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

export type BillingEntitlements = {
  context: EntitlementContext;
  currentPeriodEnd: Date;
  currentPeriodStart: Date;
  customerId: string | null;
  items: Array<{ key: string; projectIds: string[]; quantity: number }>;
  scopeKey: string;
  spendAlertCents: number | null;
  subscriptionId: string | null;
};

export async function resolveBillingEntitlements(
  userId: string,
  projectId?: string | null,
  organizationId?: string | null,
): Promise<BillingEntitlements> {
  const scope = projectId
    ? await projectBillingScope(projectId)
    : { organizationId: organizationId ?? null, ownerId: userId };
  const [subscription, isLimitExempt] = await Promise.all([
    prisma.billingSubscription.findFirst({
      where: {
        status: { in: ACTIVE_STATUSES },
        ...(scope.organizationId
          ? { organizationId: scope.organizationId }
          : { organizationId: null, userId: scope.ownerId }),
      },
      include: { items: { where: { active: true } } },
      orderBy: { createdAt: "desc" },
    }),
    isBillingScopeWhitelisted(scope),
  ]);
  const now = new Date();
  const fallback = periodFallback(now);
  const start = subscription?.currentPeriodStart ?? fallback.start;
  const end = subscription?.currentPeriodEnd ?? fallback.end;
  const items =
    subscription?.items.map((item) => ({
      key: item.productKey,
      projectIds: item.projectIds,
      quantity: item.quantity,
    })) ?? [];
  return {
    context: {
      addOns: addOnState(items),
      entitlementOverrides: parseEntitlementOverrides(
        subscription?.entitlementOverrides,
      ),
      isLimitExempt,
      overageRateOverrides: parseRateOverrides(
        subscription?.overageRateOverrides,
      ),
      overagesEnabled: subscription?.overagesEnabled ?? false,
      plan: planKey(subscription?.planKey),
      spendLimitCents: subscription?.spendLimitCents ?? null,
    },
    currentPeriodEnd: end,
    currentPeriodStart: start,
    customerId: subscription?.stripeCustomerId ?? null,
    items,
    scopeKey: scope.organizationId
      ? `organization:${scope.organizationId}`
      : `user:${scope.ownerId}`,
    spendAlertCents: subscription?.spendAlertCents ?? null,
    subscriptionId: subscription?.id ?? null,
  };
}

export async function assertResourceAvailable(input: {
  current: number;
  increment?: number;
  organizationId?: string | null;
  projectId?: string | null;
  resource: ResourceKey;
  userId: string;
}): Promise<void> {
  const entitlements = await resolveBillingEntitlements(
    input.userId,
    input.projectId,
    input.organizationId,
  );
  const limit = resourceLimit(entitlements.context, input.resource);
  if (limit !== null && input.current + (input.increment ?? 1) > limit) {
    throw new ConflictError(
      `Your ${entitlements.context.plan} plan allows ${limit} ${input.resource.replaceAll("_", " ")}.`,
    );
  }
}

export async function assertAddOnEnabled(input: {
  addOn: AddOnKey;
  projectId: string;
  userId: string;
}): Promise<void> {
  const entitlements = await resolveBillingEntitlements(
    input.userId,
    input.projectId,
  );
  if (
    entitlements.context.plan === "hobby" &&
    input.addOn === "speed_insights"
  ) {
    return;
  }
  const item = entitlements.items.find(
    (candidate) => candidate.key === input.addOn,
  );
  if (
    !hasAddOn(
      entitlements.context,
      input.addOn,
      input.projectId,
      item?.projectIds,
    )
  ) {
    throw new ConflictError(
      `${input.addOn.replaceAll("_", " ")} is not active for this project.`,
    );
  }
}
