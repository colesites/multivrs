import "server-only";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";
import { prisma } from "@/lib/prisma";

export async function listSavedDomains(
  userId: string,
): Promise<DomainSearchResult[]> {
  const domains = await prisma.savedDomain.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return domains.map((domain) => ({
    domain: domain.hostname,
    available: true,
    premium: domain.premium,
    price: domain.price,
    renewalPrice: domain.renewalPrice,
    currency: domain.currency,
  }));
}

export async function saveDomain(
  userId: string,
  result: DomainSearchResult,
): Promise<void> {
  const hostname = result.domain.trim().toLowerCase();
  try {
    await upsertSavedDomain(userId, hostname, result);
  } catch (error) {
    if (!isTransientDatabaseError(error)) throw error;
    await upsertSavedDomain(userId, hostname, result);
  }
}

function upsertSavedDomain(
  userId: string,
  hostname: string,
  result: DomainSearchResult,
) {
  return prisma.savedDomain.upsert({
    where: {
      userId_hostname: { userId, hostname },
    },
    create: {
      userId,
      hostname,
      price: result.price,
      renewalPrice: result.renewalPrice ?? null,
      currency: result.currency.toUpperCase(),
      premium: result.premium,
    },
    update: {
      price: result.price,
      renewalPrice: result.renewalPrice ?? null,
      currency: result.currency.toUpperCase(),
      premium: result.premium,
    },
  });
}

function isTransientDatabaseError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const value = `${error.name} ${error.message}`.toLowerCase();
  return ["p1001", "p1002", "p1017", "connection", "socket", "websocket"].some(
    (token) => value.includes(token),
  );
}

export async function removeSavedDomain(
  userId: string,
  hostname: string,
): Promise<void> {
  await prisma.savedDomain.deleteMany({
    where: { userId, hostname: hostname.trim().toLowerCase() },
  });
}
