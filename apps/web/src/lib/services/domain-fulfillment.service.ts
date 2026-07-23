import "server-only";
import { isOpenproviderSandbox } from "@/lib/domains/openprovider-client";
import { getPaidCustomerHandle } from "@/lib/domains/openprovider-paid-customer";
import { registerPaidDomain } from "@/lib/domains/openprovider-register";
import { getStripe } from "@/lib/payments/stripe-client";
import { prisma } from "@/lib/prisma";
import { connectDomain } from "@/lib/services/domain-management.service";

export interface DomainFulfillmentResult {
  domainId: string;
  hostname: string;
  projectSlug: string;
  username: string;
}

export async function failDomainCheckout(
  sessionId: string,
  reason: string,
): Promise<void> {
  await prisma.domainOrder.updateMany({
    where: {
      stripeSessionId: sessionId,
      status: { in: ["pending", "processing"] },
    },
    data: { status: "failed", failureMessage: reason },
  });
}

export async function fulfillDomainCheckout(
  sessionId: string,
): Promise<DomainFulfillmentResult> {
  if (isOpenproviderSandbox()) {
    throw new Error("Paid fulfillment is disabled in sandbox mode");
  }
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    throw new Error("Payment has not completed");
  }
  const order = await prisma.domainOrder.findUnique({
    where: { stripeSessionId: session.id },
    include: {
      project: { select: { slug: true } },
      user: { select: { username: true } },
    },
  });
  if (!order || session.metadata?.orderId !== order.id) {
    throw new Error("Domain order not found");
  }
  if (
    session.amount_total !== order.amount ||
    session.currency !== order.currency
  ) {
    throw new Error("Paid amount does not match the domain order");
  }
  if (order.status === "fulfilled") {
    return fulfillmentResult(order, await connectedDomainId(order.hostname));
  }
  const claimed = await prisma.domainOrder.updateMany({
    where: { id: order.id, status: { in: ["pending", "paid"] } },
    data: { status: "processing", failureMessage: null },
  });
  if (claimed.count === 0) return waitForFulfillment(order);
  try {
    const handle = await getPaidCustomerHandle(session.customer_details);
    let providerDomainId = order.providerDomainId;
    if (!providerDomainId) {
      const registration = await registerPaidDomain(order.hostname, handle);
      providerDomainId =
        registration.providerDomainId?.toString() ?? "registered";
      await prisma.domainOrder.update({
        where: { id: order.id },
        data: { providerDomainId },
      });
    }
    const domainId = await connectPurchasedDomain(order);
    await prisma.domainOrder.update({
      where: { id: order.id },
      data: {
        status: "fulfilled",
        providerDomainId,
      },
    });
    return fulfillmentResult(order, domainId);
  } catch (error) {
    await prisma.domainOrder.update({
      where: { id: order.id },
      data: {
        status: "paid",
        failureMessage:
          error instanceof Error ? error.message : "Registration failed",
      },
    });
    throw error;
  }
}

async function connectPurchasedDomain(order: {
  userId: string;
  projectId: string;
  hostname: string;
}): Promise<string> {
  const existing = await prisma.domain.findUnique({
    where: { hostname: order.hostname },
    include: { project: { select: { ownerId: true } } },
  });
  if (existing) {
    if (
      existing.projectId !== order.projectId ||
      existing.project.ownerId !== order.userId
    ) {
      throw new Error("Domain is connected to another project");
    }
    return existing.id;
  }
  const domain = await connectDomain(order.userId, {
    hostname: order.hostname,
    projectId: order.projectId,
  });
  return domain.id;
}

async function waitForFulfillment(source: {
  id: string;
  hostname: string;
  project: { slug: string };
  user: { username: string | null };
}): Promise<DomainFulfillmentResult> {
  const order = await prisma.domainOrder.findUnique({
    where: { id: source.id },
    select: { status: true },
  });
  if (order?.status !== "fulfilled") {
    throw new Error("Domain registration is processing");
  }
  return fulfillmentResult(source, await connectedDomainId(source.hostname));
}

async function connectedDomainId(hostname: string): Promise<string> {
  const domain = await prisma.domain.findUnique({
    where: { hostname },
    select: { id: true },
  });
  if (!domain) throw new Error("Registered domain is not connected");
  return domain.id;
}

function fulfillmentResult(
  order: {
    hostname: string;
    project: { slug: string };
    user: { username: string | null };
  },
  domainId: string,
): DomainFulfillmentResult {
  return {
    domainId,
    hostname: order.hostname,
    projectSlug: order.project.slug,
    username: order.user.username ?? "dashboard",
  };
}
