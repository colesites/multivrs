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
  await prisma.savedDomain.upsert({
    where: {
      userId_hostname: { userId, hostname: result.domain },
    },
    create: {
      userId,
      hostname: result.domain,
      price: result.price,
      renewalPrice: result.renewalPrice,
      currency: result.currency,
      premium: result.premium,
    },
    update: {
      price: result.price,
      renewalPrice: result.renewalPrice,
      currency: result.currency,
      premium: result.premium,
    },
  });
}

export async function removeSavedDomain(
  userId: string,
  hostname: string,
): Promise<void> {
  await prisma.savedDomain.deleteMany({ where: { userId, hostname } });
}
