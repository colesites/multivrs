import type Stripe from "stripe";
import { identifyBillingProduct } from "@/lib/payments/stripe-product-catalog";
import { prisma } from "@/lib/prisma";

export type IdentifiedSubscriptionItem = {
  identified: ReturnType<typeof identifyBillingProduct>;
  item: Stripe.SubscriptionItem;
};

export function identifySubscriptionItems(
  items: Stripe.SubscriptionItem[],
): IdentifiedSubscriptionItem[] {
  return items.map((item) => ({
    identified: identifyBillingProduct(item.price),
    item,
  }));
}

export async function syncSubscriptionItems(
  subscriptionId: string,
  products: IdentifiedSubscriptionItem[],
): Promise<void> {
  const activeIds = products.map(({ item }) => item.id);
  await prisma.$transaction([
    ...products.map(({ identified, item }) => {
      const period = subscriptionItemPeriod(item);
      return prisma.billingSubscriptionItem.upsert({
        where: { stripeSubscriptionItemId: item.id },
        create: {
          active: true,
          billingSubscriptionId: subscriptionId,
          currentPeriodEnd: period.end,
          currentPeriodStart: period.start,
          kind: identified.kind,
          lookupKey: item.price.lookup_key,
          productKey: identified.key,
          projectIds: [],
          quantity: item.quantity ?? 1,
          stripePriceId: item.price.id,
          stripeProductId: stripeObjectId(item.price.product) ?? "",
          stripeSubscriptionItemId: item.id,
        },
        update: {
          active: true,
          currentPeriodEnd: period.end,
          currentPeriodStart: period.start,
          kind: identified.kind,
          lookupKey: item.price.lookup_key,
          productKey: identified.key,
          quantity: item.quantity ?? 1,
          stripePriceId: item.price.id,
          stripeProductId: stripeObjectId(item.price.product) ?? "",
        },
      });
    }),
    prisma.billingSubscriptionItem.updateMany({
      where: {
        billingSubscriptionId: subscriptionId,
        stripeSubscriptionItemId: { notIn: activeIds },
      },
      data: { active: false },
    }),
  ]);
}

export function subscriptionItemPeriod(item: Stripe.SubscriptionItem): {
  end: Date;
  start: Date;
} {
  return {
    end: new Date(item.current_period_end * 1_000),
    start: new Date(item.current_period_start * 1_000),
  };
}

export function stripeObjectId(
  value: { id: string } | string | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
