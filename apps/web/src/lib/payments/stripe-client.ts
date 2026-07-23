import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}

export function getDomainWebhookSecret(): string {
  return webhookSecret("STRIPE_DOMAIN_WEBHOOK_SECRET");
}

export function getSubscriptionWebhookSecret(): string {
  return webhookSecret("STRIPE_SUBSCRIPTION_WEBHOOK_SECRET");
}

function webhookSecret(name: string): string {
  const secret = process.env[name]?.trim();
  if (!secret) throw new Error(`${name} is not configured`);
  return secret;
}
