import "server-only";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";
import { syncBillingSubscription } from "@/lib/services/billing-subscription-sync.service";

export async function syncBillingInvoice(
  invoice: Stripe.Invoice,
  paymentStatus?: string,
): Promise<void> {
  const subscriptionId = stripeId(
    invoice.parent?.subscription_details?.subscription,
  );
  const subscription = subscriptionId
    ? await prisma.billingSubscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
        select: { id: true },
      })
    : null;
  await prisma.billingInvoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      amountDueCents: invoice.amount_due,
      amountPaidCents: invoice.amount_paid,
      amountRemainingCents: invoice.amount_remaining,
      billingSubscriptionId: subscription?.id,
      currency: invoice.currency,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      periodEnd: timestamp(invoice.period_end),
      periodStart: timestamp(invoice.period_start),
      status: invoice.status ?? "unknown",
      stripeInvoiceId: invoice.id,
    },
    update: {
      amountDueCents: invoice.amount_due,
      amountPaidCents: invoice.amount_paid,
      amountRemainingCents: invoice.amount_remaining,
      billingSubscriptionId: subscription?.id,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      status: invoice.status ?? "unknown",
    },
  });
  if (!subscriptionId || !paymentStatus) return;
  const remote = await getStripe().subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product"],
  });
  await syncBillingSubscription(remote, {}, paymentStatus);
}

function stripeId(
  value: { id: string } | string | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function timestamp(value?: number | null): Date | null {
  return value ? new Date(value * 1_000) : null;
}
