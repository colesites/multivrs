import "server-only";
import type Stripe from "stripe";
import { z } from "zod";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";

type PaymentStatus =
  | "paid"
  | "failed"
  | "action_required"
  | "finalization_failed";

export async function handleSubscriptionEvent(
  event: Stripe.Event,
): Promise<void> {
  const processed = await prisma.stripeWebhookEvent.findUnique({
    where: { id: event.id },
    select: { id: true },
  });
  if (processed) return;
  await dispatchSubscriptionEvent(event);
  await prisma.stripeWebhookEvent.upsert({
    where: { id: event.id },
    create: { id: event.id, type: event.type },
    update: {},
  });
}

async function dispatchSubscriptionEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await syncCheckoutSession(event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed":
    case "customer.subscription.trial_will_end":
      await syncSubscription(event.data.object);
      break;
    case "invoice.paid":
      await syncInvoiceSubscription(event.data.object, "paid");
      break;
    case "invoice.payment_failed":
      await syncInvoiceSubscription(event.data.object, "failed");
      break;
    case "invoice.payment_action_required":
      await syncInvoiceSubscription(event.data.object, "action_required");
      break;
    case "invoice.finalization_failed":
      await syncInvoiceSubscription(event.data.object, "finalization_failed");
      break;
    default:
      break;
  }
}

async function syncCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.metadata?.checkoutType !== "subscription") return;
  const subscriptionId = stripeId(session.subscription);
  if (!subscriptionId) throw new Error("Subscription ID is missing");
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  await syncSubscription(
    subscription,
    undefined,
    session.metadata.userId ?? session.client_reference_id ?? undefined,
  );
}

async function syncInvoiceSubscription(
  invoice: Stripe.Invoice,
  paymentStatus: PaymentStatus,
): Promise<void> {
  const subscriptionId = stripeId(
    invoice.parent?.subscription_details?.subscription,
  );
  if (!subscriptionId) return;
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  await syncSubscription(subscription, paymentStatus);
}

async function syncSubscription(
  subscription: Stripe.Subscription,
  paymentStatus?: PaymentStatus,
  suppliedUserId?: string,
): Promise<void> {
  const item = subscription.items.data[0];
  if (!item) throw new Error("Subscription has no price item");
  const existing = await prisma.billingSubscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    select: { userId: true },
  });
  const userId = await resolveUserId(
    suppliedUserId ?? subscription.metadata.userId,
    existing?.userId,
  );
  const data = {
    userId,
    stripeCustomerId: stripeId(subscription.customer) ?? "",
    stripePriceId: item.price.id,
    stripeProductId: stripeId(item.price.product) ?? "",
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodStart: new Date(item.current_period_start * 1000),
    currentPeriodEnd: new Date(item.current_period_end * 1000),
    ...(paymentStatus ? { lastPaymentStatus: paymentStatus } : {}),
  };
  await prisma.billingSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: { stripeSubscriptionId: subscription.id, ...data },
    update: data,
  });
}

async function resolveUserId(
  candidate?: string,
  existing?: string | null,
): Promise<string | null> {
  if (!candidate || !z.uuid().safeParse(candidate).success) {
    return existing ?? null;
  }
  const user = await prisma.user.findUnique({
    where: { id: candidate },
    select: { id: true },
  });
  return user?.id ?? existing ?? null;
}

function stripeId(
  value: { id: string } | string | null | undefined,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
