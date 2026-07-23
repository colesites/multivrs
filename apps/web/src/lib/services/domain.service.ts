import "server-only";
import { prisma } from "@/lib/prisma";

export interface DashboardDomain {
  id: string;
  name: string;
  project: string;
  status: string;
  managed: boolean;
  renewalLabel: string;
}

export interface DomainProjectOption {
  id: string;
  name: string;
  slug: string;
}

export async function dashboardDomains(
  userId: string,
  projectSlug?: string,
): Promise<DashboardDomain[]> {
  const domains = await prisma.domain.findMany({
    where: {
      project: {
        ownerId: userId,
        ...(projectSlug ? { slug: projectSlug } : {}),
      },
    },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return domains.map((domain) => ({
    id: domain.id,
    name: domain.hostname,
    project: domain.project.name,
    status:
      domain.verified && domain.certStatus === "active" ? "Active" : "Pending",
    managed: false,
    renewalLabel: "—",
  }));
}

export async function domainProjectOptions(
  userId: string,
  projectSlug?: string,
): Promise<DomainProjectOption[]> {
  return prisma.project.findMany({
    where: { ownerId: userId, ...(projectSlug ? { slug: projectSlug } : {}) },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}
