import "server-only";
import type Stripe from "stripe";
import { parseQuoteBillingTerms } from "@/lib/payments/billing-quote-metadata";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";
import { syncBillingInvoice } from "@/lib/services/billing-invoice-sync.service";
import { syncBillingSubscription } from "@/lib/services/billing-subscription-sync.service";

export async function handleSubscriptionEvent(
  event: Stripe.Event,
): Promise<void> {
  const processed = await prisma.stripeWebhookEvent.findUnique({
    where: { id: event.id },
    select: { id: true },
  });
  if (processed) return;
  await dispatch(event);
  await prisma.stripeWebhookEvent.upsert({
    where: { id: event.id },
    create: { id: event.id, type: event.type },
    update: {},
  });
}

async function dispatch(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await syncCheckout(event.data.object);
      return;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
    case "customer.subscription.trial_will_end":
      await syncBillingSubscription(event.data.object);
      return;
    case "invoice.created":
    case "invoice.finalized":
    case "invoice.updated":
    case "invoice.voided":
    case "invoice.marked_uncollectible":
      await syncBillingInvoice(event.data.object);
      return;
    case "invoice.paid":
      await syncBillingInvoice(event.data.object, "paid");
      return;
    case "invoice.payment_failed":
      await syncBillingInvoice(event.data.object, "failed");
      return;
    case "invoice.payment_action_required":
      await syncBillingInvoice(event.data.object, "action_required");
      return;
    case "invoice.finalization_failed":
      await syncBillingInvoice(event.data.object, "finalization_failed");
      return;
    case "quote.accepted":
      await syncAcceptedQuote(event.data.object);
      return;
    default:
      return;
  }
}

async function syncCheckout(session: Stripe.Checkout.Session): Promise<void> {
  if (session.metadata?.checkoutType !== "subscription") return;
  const subscriptionId = stripeId(session.subscription);
  if (!subscriptionId) throw new Error("Subscription ID is missing");
  const subscription = await getStripe().subscriptions.retrieve(
    subscriptionId,
    {
      expand: ["items.data.price.product"],
    },
  );
  await syncBillingSubscription(subscription, {
    organizationId: session.metadata.organizationId,
    userId: session.metadata.userId ?? session.client_reference_id ?? undefined,
  });
}

async function syncAcceptedQuote(quote: Stripe.Quote): Promise<void> {
  const subscriptionId = stripeId(quote.subscription);
  if (!subscriptionId) return;
  const subscription = await getStripe().subscriptions.retrieve(
    subscriptionId,
    {
      expand: ["items.data.price.product"],
    },
  );
  await syncBillingSubscription(subscription, {
    ...parseQuoteBillingTerms(quote.metadata),
    organizationId: quote.metadata.organizationId,
    quoteId: quote.id,
    userId: quote.metadata.userId,
  });
}

function stripeId(
  value: { id: string } | string | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
