import "server-only";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import { getProPlan } from "@/lib/payments/pricing";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = ["active", "trialing", "past_due", "unpaid"];

export async function createSubscriptionCheckout(
  userId: string,
  options?: { organizationId?: string | null; returnSlug?: string | null },
): Promise<{ checkoutUrl: string }> {
  const organizationId = options?.organizationId || null;
  const returnSlug = options?.returnSlug || null;

  const [user, current, proPlan] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true },
    }),
    prisma.billingSubscription.findFirst({
      where: organizationId
        ? { organizationId, status: { in: ACTIVE_STATUSES } }
        : { userId, status: { in: ACTIVE_STATUSES } },
      orderBy: { createdAt: "desc" },
      select: { stripeCustomerId: true },
    }),
    getProPlan(),
  ]);
  if (!user) throw new NotFoundError("User not found");
  if (current) {
    throw new ConflictError("You already have an active Pro subscription");
  }
  if (!proPlan.configured || !proPlan.priceId) {
    throw new ConflictError("The Pro plan is not available for checkout");
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000";
  const metadata: Record<string, string> = {
    checkoutType: "subscription",
    userId,
    ...(organizationId ? { organizationId } : {}),
  };
  const targetSlug = returnSlug ?? user.username ?? "dashboard";
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    client_reference_id: userId,
    customer_email: user.email,
    line_items: [{ price: proPlan.priceId, quantity: 1 }],
    metadata,
    subscription_data: { metadata },
    allow_promotion_codes: true,
    success_url: `${origin}/${targetSlug}?subscription=success`,
    cancel_url: `${origin}/${targetSlug}?subscription=canceled`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return { checkoutUrl: session.url };
}
