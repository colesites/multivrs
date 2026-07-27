import "server-only";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import type { DomainCheckoutInput } from "@/lib/domains/domain-checkout.schemas";
import { searchOpenproviderExtensions } from "@/lib/domains/openprovider";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";
import { reuseOrReplaceDomainCheckout } from "@/lib/services/domain-checkout-reuse.service";

export interface DomainCheckoutResult {
  clientSecret: string;
}

export async function createDomainCheckout(
  userId: string,
  input: DomainCheckoutInput,
): Promise<DomainCheckoutResult> {
  const [user, connected, activeOrders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    }),
    prisma.domain.findFirst({
      where: { hostname: { in: input.hostnames } },
      select: { id: true },
    }),
    prisma.domainOrder.findMany({
      where: {
        hostname: { in: input.hostnames },
        status: { in: ["pending", "processing", "paid"] },
      },
      select: {
        hostname: true,
        stripeSessionId: true,
        userId: true,
      },
    }),
  ]);
  if (!user) throw new NotFoundError("Account not found");
  if (connected) throw new ConflictError("A domain is already connected");
  if (activeOrders.length) {
    const reusable = await reuseOrReplaceDomainCheckout(
      userId,
      input.hostnames,
      activeOrders,
    );
    if (reusable) return { clientSecret: reusable };
  }
  const results = await Promise.all(input.hostnames.map(checkDomain));
  const unavailable = results.find(
    (result) => !result?.available || result.price === null,
  );
  if (unavailable || results.some((result) => !result)) {
    throw new ConflictError(
      `${unavailable?.domain ?? "A domain"} is no longer available`,
    );
  }
  const available = results.filter((result) => result !== undefined);
  const currencies = new Set(
    available.map((result) => result.currency.toLowerCase()),
  );
  if (currencies.size !== 1) {
    throw new ConflictError("Cart domains must use the same currency");
  }
  const currency = available[0]?.currency.toLowerCase() ?? "usd";
  const orders = await prisma.$transaction(
    available.map((result) =>
      prisma.domainOrder.create({
        data: {
          user: { connect: { id: userId } },
          hostname: result.domain,
          amount: Math.round((result.price as number) * 100),
          currency,
        },
      }),
    ),
  );
  try {
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.BETTER_AUTH_URL ??
      "http://localhost:3000";
    const orderIds = orders.map((order) => order.id);
    const metadata = {
      checkoutType: "domain",
      checkoutVersion: "custom-v3",
      orderIds: JSON.stringify(orderIds),
    };
    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: orders[0]?.id,
        payment_method_types: ["card"],
        phone_number_collection: { enabled: true },
        ui_mode: "elements",
        return_url: `${origin}/domains/order/success?session_id={CHECKOUT_SESSION_ID}`,
        metadata,
        payment_intent_data: { metadata },
        line_items: orders.map((order) => ({
          quantity: 1,
          price_data: {
            currency,
            unit_amount: order.amount,
            product_data: {
              name: order.hostname,
              description: "One-year domain registration",
            },
          },
        })),
      },
      { idempotencyKey: orders[0]?.id },
    );
    if (!session.client_secret) {
      throw new Error("Stripe did not return a Checkout client secret");
    }
    await prisma.$transaction(
      orders.map((order, index) =>
        prisma.domainOrder.update({
          where: { id: order.id },
          data: {
            stripeSessionId:
              index === 0 ? session.id : `${session.id}:${index}`,
          },
        }),
      ),
    );
    return { clientSecret: session.client_secret };
  } catch (error) {
    await prisma.domainOrder.updateMany({
      where: { id: { in: orders.map((order) => order.id) } },
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
