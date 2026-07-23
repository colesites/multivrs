import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSubscriptionWebhookSecret } from "@/lib/payments/stripe-client";
import { verifyStripeWebhook } from "@/lib/payments/stripe-webhook";
import { handleSubscriptionEvent } from "@/lib/services/subscription-webhook.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let event: Stripe.Event;
  try {
    event = await verifyStripeWebhook(request, getSubscriptionWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    await handleSubscriptionEvent(event);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Subscription webhook processing failed" },
      { status: 500 },
    );
  }
}
