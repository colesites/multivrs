import "server-only";
import { ConflictError } from "@multivrs/error-utils";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";

interface ActiveDomainOrder {
  hostname: string;
  stripeSessionId: string | null;
  userId: string;
}

export async function reuseOrReplaceDomainCheckout(
  userId: string,
  hostnames: string[],
  activeOrders: ActiveDomainOrder[],
): Promise<string | null> {
  if (activeOrders.some((order) => order.userId !== userId)) {
    throw new ConflictError(
      `A checkout for ${activeOrders[0]?.hostname} is already active`,
    );
  }
  const sessionId = activeOrders
    .map((order) => order.stripeSessionId?.split(":")[0])
    .find(Boolean);
  if (!sessionId) {
    throw new ConflictError("This checkout is already being created");
  }
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const orderIds = parseOrderIds(session.metadata?.orderIds);
  const sessionOrders = await prisma.domainOrder.findMany({
    where: { id: { in: orderIds } },
    select: { hostname: true },
  });
  const current = new Set(sessionOrders.map((order) => order.hostname));
  const requested = new Set(hostnames);
  const exactCart =
    current.size === requested.size &&
    [...current].every((hostname) => requested.has(hostname));
  if (
    exactCart &&
    session.status === "open" &&
    session.ui_mode === "elements" &&
    session.metadata?.checkoutVersion === "custom-v3" &&
    session.client_secret
  ) {
    return session.client_secret;
  }
  if (session.status === "open") {
    await getStripe().checkout.sessions.expire(session.id);
  }
  await prisma.domainOrder.updateMany({
    where: {
      OR: [
        { stripeSessionId: session.id },
        { stripeSessionId: { startsWith: `${session.id}:` } },
      ],
    },
    data: { status: "failed", failureMessage: "Checkout replaced" },
  });
  return null;
}

function parseOrderIds(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
