import "server-only";
import { ConflictError } from "@multivrs/error-utils";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";
import {
  requireBillingScope,
  subscriptionScopeWhere,
} from "@/lib/services/billing-scope-access.service";

export async function createBillingPortal(
  userId: string,
  scopeId: string,
): Promise<{ url: string }> {
  const access = await requireBillingScope(userId, scopeId, true);
  const subscription = await prisma.billingSubscription.findFirst({
    where: subscriptionScopeWhere(access),
    orderBy: { createdAt: "desc" },
    select: { stripeCustomerId: true },
  });
  if (!subscription)
    throw new ConflictError("This billing scope has no Stripe customer");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { username: true },
  });
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000";
  const returnPath = user.username ? `/${user.username}/~/settings` : "/home";
  const session = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}${returnPath}`,
  });
  return { url: session.url };
}
