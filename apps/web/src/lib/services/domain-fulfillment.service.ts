import "server-only";
import { z } from "zod";
import {
  isLocalOpenproviderSandbox,
  isOpenproviderSandbox,
} from "@/lib/domains/openprovider-client";
import { getSandboxCustomerHandle } from "@/lib/domains/openprovider-customer";
import { getPaidCustomerHandle } from "@/lib/domains/openprovider-paid-customer";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";
import {
  type DomainFulfillmentResult,
  fulfillPaidDomainOrder,
} from "@/lib/services/domain-order-fulfillment.service";

export type { DomainFulfillmentResult };

export async function failDomainCheckout(
  sessionId: string,
  reason: string,
): Promise<void> {
  await prisma.domainOrder.updateMany({
    where: {
      OR: [
        { stripeSessionId: sessionId },
        { stripeSessionId: { startsWith: `${sessionId}:` } },
      ],
      status: { in: ["pending", "processing"] },
    },
    data: { status: "failed", failureMessage: reason },
  });
}

export async function fulfillDomainCheckout(
  sessionId: string,
): Promise<DomainFulfillmentResult[]> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    throw new Error("Payment has not completed");
  }
  const orderIds = sessionOrderIds(session.metadata);
  const rows = await prisma.domainOrder.findMany({
    where: { id: { in: orderIds } },
    include: {
      user: {
        select: { email: true, name: true, username: true },
      },
    },
  });
  const byId = new Map(rows.map((order) => [order.id, order]));
  const orders = orderIds
    .map((id) => byId.get(id))
    .filter((order) => order !== undefined);
  if (orders.length !== orderIds.length) {
    throw new Error("Domain order not found");
  }
  const amount = orders.reduce((sum, order) => sum + order.amount, 0);
  const currencies = new Set(orders.map((order) => order.currency));
  if (
    session.amount_total !== amount ||
    currencies.size !== 1 ||
    session.currency !== orders[0]?.currency
  ) {
    throw new Error("Paid amount does not match the domain order");
  }
  const sandbox = isOpenproviderSandbox();
  const firstUser = orders[0]?.user;
  if (!firstUser) throw new Error("Domain order account not found");
  const handle = sandbox
    ? isLocalOpenproviderSandbox()
      ? "LOCAL-SANDBOX"
      : await getSandboxCustomerHandle(firstUser)
    : await getPaidCustomerHandle(session.customer_details);
  return Promise.all(
    orders.map((order) => fulfillPaidDomainOrder(order, handle, sandbox)),
  );
}

function sessionOrderIds(metadata: Record<string, string> | null): string[] {
  const legacy = z.uuid().safeParse(metadata?.orderId);
  if (legacy.success) return [legacy.data];
  try {
    const parsed = z
      .array(z.uuid())
      .min(1)
      .max(10)
      .safeParse(JSON.parse(metadata?.orderIds ?? "null"));
    if (parsed.success) return parsed.data;
  } catch {}
  throw new Error("Domain checkout metadata is invalid");
}
