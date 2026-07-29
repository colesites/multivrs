import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getDomainWebhookSecret } from "@/lib/payments/stripe-client";
import { verifyStripeWebhook } from "@/lib/payments/stripe-webhook";
import {
  failDomainCheckout,
  fulfillDomainCheckout,
} from "@/lib/services/domain-fulfillment.service";

export async function POST(request: Request) {
  let event: Stripe.Event;
  try {
    event = await verifyStripeWebhook(request, getDomainWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        break;
      default:
        return NextResponse.json({ received: true });
    }
    const session = event.data.object;
    if (session.metadata?.checkoutType !== "domain") {
      return NextResponse.json({ received: true });
    }
    if (
      event.type === "checkout.session.completed" &&
      session.payment_status === "unpaid"
    ) {
      return NextResponse.json({ received: true, pending: true });
    }
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillDomainCheckout(session.id);
    } else if (event.type === "checkout.session.async_payment_failed") {
      await failDomainCheckout(session.id, "Payment failed");
    } else if (event.type === "checkout.session.expired") {
      await failDomainCheckout(session.id, "Checkout expired");
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Domain webhook processing failed" },
      { status: 500 },
    );
  }
}
