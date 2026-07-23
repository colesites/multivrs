import "server-only";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import type { DomainCheckoutInput } from "@/lib/domains/domain-checkout.schemas";
import { searchOpenproviderExtensions } from "@/lib/domains/openprovider";
import { isOpenproviderSandbox } from "@/lib/domains/openprovider-client";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";

export interface DomainCheckoutResult {
  checkoutUrl: string;
}

export async function createDomainCheckout(
  userId: string,
  input: DomainCheckoutInput,
): Promise<DomainCheckoutResult> {
  if (isOpenproviderSandbox()) {
    throw new ConflictError("Use test checkout while sandbox mode is enabled");
  }
  const [project, user, connected, activeOrder] = await Promise.all([
    prisma.project.findFirst({
      where: { id: input.projectId, ownerId: userId },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    }),
    prisma.domain.findUnique({
      where: { hostname: input.hostname },
      select: { id: true },
    }),
    prisma.domainOrder.findFirst({
      where: {
        hostname: input.hostname,
        status: { in: ["pending", "processing", "paid"] },
      },
      select: { id: true },
    }),
  ]);
  if (!project || !user) throw new NotFoundError("Project not found");
  if (connected) throw new ConflictError("This domain is already connected");
  if (activeOrder) {
    throw new ConflictError("A checkout for this domain is already active");
  }
  const result = await checkDomain(input.hostname);
  if (!result?.available || result.price === null) {
    throw new ConflictError("This domain is no longer available");
  }
  const amount = Math.round(result.price * 100);
  const currency = result.currency.toLowerCase();
  const order = await prisma.domainOrder.create({
    data: {
      userId,
      projectId: project.id,
      hostname: input.hostname,
      amount,
      currency,
    },
  });
  try {
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:3000";
    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: order.id,
        customer_email: user.email,
        billing_address_collection: "required",
        phone_number_collection: { enabled: true },
        success_url: `${origin}/domains/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/domains?q=${encodeURIComponent(input.hostname)}`,
        metadata: { checkoutType: "domain", orderId: order.id },
        payment_intent_data: {
          metadata: { checkoutType: "domain", orderId: order.id },
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: amount,
              product_data: {
                name: input.hostname,
                description: "One-year domain registration",
              },
            },
          },
        ],
      },
      { idempotencyKey: order.id },
    );
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    await prisma.domainOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });
    return { checkoutUrl: session.url };
  } catch (error) {
    await prisma.domainOrder.update({
      where: { id: order.id },
      data: {
        status: "failed",
        failureMessage:
          error instanceof Error ? error.message : "Checkout creation failed",
      },
    });
    throw error;
  }
}

async function checkDomain(hostname: string) {
  const separator = hostname.indexOf(".");
  const name = hostname.slice(0, separator);
  const extension = hostname.slice(separator + 1);
  const results = await searchOpenproviderExtensions(name, [extension]);
  return results?.find((result) => result.domain === hostname);
}
