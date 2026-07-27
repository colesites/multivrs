import "server-only";
import type { getPaidCustomerHandle } from "@/lib/domains/openprovider-paid-customer";
import {
  registerPaidDomain,
  registerSandboxDomain,
} from "@/lib/domains/openprovider-register";
import { prisma } from "@/lib/prisma";
import { notifyDomainRegistered } from "@/lib/services/domain-notification.service";

export interface DomainFulfillmentResult {
  domainId: string;
  hostname: string;
  username: string;
}

type FulfillmentOrder =
  Awaited<ReturnType<typeof loadOrderForFulfillment>> extends infer T
    ? Exclude<T, null>
    : never;

async function loadOrderForFulfillment(id: string) {
  return prisma.domainOrder.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true, username: true } },
    },
  });
}

export async function fulfillPaidDomainOrder(
  order: FulfillmentOrder,
  handle: Awaited<ReturnType<typeof getPaidCustomerHandle>>,
  sandbox = false,
): Promise<DomainFulfillmentResult> {
  if (order.status === "fulfilled") {
    return result(order, await connectedDomainId(order.hostname));
  }
  const claimed = await prisma.domainOrder.updateMany({
    where: { id: order.id, status: { in: ["pending", "paid"] } },
    data: { status: "processing", failureMessage: null },
  });
  if (claimed.count === 0) return waitForFulfillment(order);
  try {
    let providerDomainId = order.providerDomainId;
    if (!providerDomainId) {
      const registration = sandbox
        ? await registerSandboxDomain(order.hostname, handle)
        : await registerPaidDomain(order.hostname, handle);
      providerDomainId =
        registration.providerDomainId?.toString() ?? "registered";
      await prisma.domainOrder.update({
        where: { id: order.id },
        data: { providerDomainId },
      });
    }
    const domainId = await savePurchasedDomain(order, providerDomainId);
    await prisma.domainOrder.update({
      where: { id: order.id },
      data: { status: "fulfilled", providerDomainId },
    });
    await notifyDomainRegistered({
      domainId,
      hostname: order.hostname,
      userId: order.userId,
      username: order.user.username,
    });
    return result(order, domainId);
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

async function savePurchasedDomain(
  order: {
    userId: string;
    hostname: string;
  },
  providerDomainId: string,
): Promise<string> {
  const existing = await prisma.domain.findUnique({
    where: { hostname: order.hostname },
    select: { id: true, userId: true },
  });
  if (existing) {
    if (existing.userId !== order.userId)
      throw new Error("Domain belongs to another account");
    return existing.id;
  }
  return (
    await prisma.domain.create({
      data: {
        userId: order.userId,
        hostname: order.hostname,
        projectId: null,
        managed: true,
        autoRenew: true,
        expiresAt: oneYearFromNow(),
        providerDomainId,
      },
      select: { id: true },
    })
  ).id;
}

function oneYearFromNow(): Date {
  const expiresAt = new Date();
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);
  return expiresAt;
}

async function waitForFulfillment(
  order: FulfillmentOrder,
): Promise<DomainFulfillmentResult> {
  const current = await prisma.domainOrder.findUnique({
    where: { id: order.id },
    select: { status: true },
  });
  if (current?.status !== "fulfilled") {
    throw new Error("Domain registration is processing");
  }
  return result(order, await connectedDomainId(order.hostname));
}

async function connectedDomainId(hostname: string): Promise<string> {
  const domain = await prisma.domain.findUnique({
    where: { hostname },
    select: { id: true },
  });
  if (!domain) throw new Error("Registered domain is not connected");
  return domain.id;
}

function result(
  order: FulfillmentOrder,
  domainId: string,
): DomainFulfillmentResult {
  return {
    domainId,
    hostname: order.hostname,
    username: order.user.username ?? "dashboard",
  };
}
