import "server-only";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe-client";

export async function verifyStripeWebhook(
  request: Request,
  secret: string,
): Promise<Stripe.Event> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) throw new Error("Missing Stripe signature");
  return getStripe().webhooks.constructEvent(
    await request.text(),
    signature,
    secret,
  );
}
