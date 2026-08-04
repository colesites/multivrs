import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  validBillingOrganization,
  validBillingUser,
} from "@/lib/services/billing-subscription-identity.service";
import {
  identifySubscriptionItems,
  stripeObjectId,
  subscriptionItemPeriod,
  syncSubscriptionItems,
} from "@/lib/services/billing-subscription-items.service";

type SyncIdentity = {
  entitlementOverrides?: Record<string, number | null>;
  organizationId?: string;
  overageRateOverrides?: Record<string, number>;
  overagesEnabled?: boolean;
  quoteId?: string;
  spendAlertCents?: number;
  spendLimitCents?: number;
  userId?: string;
};

export async function syncBillingSubscription(
  subscription: Stripe.Subscription,
  supplied: SyncIdentity = {},
  paymentStatus?: string,
): Promise<void> {
  const first = subscription.items.data[0];
  if (!first) throw new Error("Subscription has no price item");
  const existing = await prisma.billingSubscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    select: { organizationId: true, userId: true },
  });
  const [userId, organizationId] = await Promise.all([
    validBillingUser(
      supplied.userId ?? subscription.metadata.userId,
      existing?.userId,
    ),
    validBillingOrganization(
      supplied.organizationId ?? subscription.metadata.organizationId,
      existing?.organizationId,
    ),
  ]);
  const products = identifySubscriptionItems(subscription.items.data);
  const plan =
    products.some(({ identified }) => identified.key === "enterprise_plan") ||
    supplied.quoteId
      ? "enterprise"
      : "pro";
  const period = subscriptionItemPeriod(first);
  const parent = await prisma.billingSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: period.end,
      currentPeriodStart: period.start,
      entitlementOverrides: supplied.entitlementOverrides,
      organizationId,
      overageRateOverrides: supplied.overageRateOverrides,
      overagesEnabled: supplied.overagesEnabled ?? false,
      planKey: plan,
      spendAlertCents: supplied.spendAlertCents,
      spendLimitCents: supplied.spendLimitCents,
      status: subscription.status,
      stripeCustomerId: stripeObjectId(subscription.customer) ?? "",
      stripePriceId: first.price.id,
      stripeProductId: stripeObjectId(first.price.product) ?? "",
      stripeQuoteId: supplied.quoteId,
      stripeSubscriptionId: subscription.id,
      userId: organizationId ? null : userId,
      ...(paymentStatus ? { lastPaymentStatus: paymentStatus } : {}),
    },
    update: {
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: period.end,
      currentPeriodStart: period.start,
      ...(supplied.entitlementOverrides
        ? { entitlementOverrides: supplied.entitlementOverrides }
        : {}),
      organizationId,
      ...(supplied.overageRateOverrides
        ? { overageRateOverrides: supplied.overageRateOverrides }
        : {}),
      ...(supplied.overagesEnabled === undefined
        ? {}
        : { overagesEnabled: supplied.overagesEnabled }),
      planKey: plan,
      ...(supplied.spendAlertCents === undefined
        ? {}
        : { spendAlertCents: supplied.spendAlertCents }),
      ...(supplied.spendLimitCents === undefined
        ? {}
        : { spendLimitCents: supplied.spendLimitCents }),
      status: subscription.status,
      stripeCustomerId: stripeObjectId(subscription.customer) ?? "",
      stripePriceId: first.price.id,
      stripeProductId: stripeObjectId(first.price.product) ?? "",
      ...(supplied.quoteId ? { stripeQuoteId: supplied.quoteId } : {}),
      userId: organizationId ? null : userId,
      ...(paymentStatus ? { lastPaymentStatus: paymentStatus } : {}),
    },
  });
  await syncSubscriptionItems(parent.id, products);
}
