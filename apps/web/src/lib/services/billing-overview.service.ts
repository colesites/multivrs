import "server-only";
import type {
  BillingOverview,
  BillingScopeSummary,
} from "@/features/dashboard/types/billing.types";
import type { AddOnKey, PlanKey } from "@/lib/payments/billing.types";
import { ADD_ON_KEYS, PLAN_KEYS } from "@/lib/payments/billing.types";
import { prisma } from "@/lib/prisma";
import {
  requireBillingScope,
  subscriptionScopeWhere,
} from "@/lib/services/billing-scope-access.service";

const ACTIVE = ["active", "trialing", "past_due", "unpaid"];

export async function getBillingOverview(
  userId: string,
): Promise<BillingOverview> {
  const memberships = await prisma.member.findMany({
    where: { userId },
    select: { organizationId: true },
    orderBy: { createdAt: "asc" },
  });
  const scopeIds = [
    "personal",
    ...memberships.map((item) => item.organizationId),
  ];
  return {
    scopes: await Promise.all(
      scopeIds.map((scopeId) => scopeSummary(userId, scopeId)),
    ),
  };
}

async function scopeSummary(
  userId: string,
  scopeId: string,
): Promise<BillingScopeSummary> {
  const access = await requireBillingScope(userId, scopeId);
  const subscription = await prisma.billingSubscription.findFirst({
    where: { ...subscriptionScopeWhere(access), status: { in: ACTIVE } },
    include: {
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
      items: { where: { active: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const [spend, projects] = await Promise.all([
    subscription
      ? prisma.billingMeterEvent.aggregate({
          where: {
            billingSubscriptionId: subscription.id,
            createdAt: { gte: subscription.currentPeriodStart ?? undefined },
          },
          _sum: { estimatedCostCents: true },
        })
      : null,
    prisma.project.findMany({
      where: access.organizationId
        ? { organizationId: access.organizationId }
        : { organizationId: null, ownerId: userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return {
    addOns: addOns(subscription?.items ?? []),
    canManage: access.canManage,
    currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    estimatedUsageCents: spend?._sum.estimatedCostCents ?? 0,
    invoices: (subscription?.invoices ?? []).map((invoice) => ({
      amountDueCents: invoice.amountDueCents,
      currency: invoice.currency,
      hostedInvoiceUrl: invoice.hostedInvoiceUrl,
      id: invoice.stripeInvoiceId,
      status: invoice.status,
    })),
    name: access.name,
    overagesEnabled: subscription?.overagesEnabled ?? false,
    plan: plan(subscription?.planKey),
    projects,
    scopeId: access.scopeId,
    spendAlertCents: subscription?.spendAlertCents ?? null,
    spendLimitCents: subscription?.spendLimitCents ?? null,
    status: subscription?.status ?? "hobby",
    subscriptionId: subscription?.id ?? null,
  };
}

function addOns(
  items: Array<{ productKey: string; projectIds: string[]; quantity: number }>,
) {
  return items.flatMap((item) =>
    isAddOn(item.productKey)
      ? [
          {
            key: item.productKey,
            projectIds: item.projectIds,
            quantity: item.quantity,
          },
        ]
      : [],
  );
}

function isAddOn(value: string): value is AddOnKey {
  return ADD_ON_KEYS.some((key) => key === value);
}

function plan(value?: string): PlanKey {
  return PLAN_KEYS.find((key) => key === value) ?? (value ? "pro" : "hobby");
}
