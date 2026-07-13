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

export async function dashboardDomains(userId: string, projectSlug?: string): Promise<DashboardDomain[]> {
  const domains = await prisma.domain.findMany({
    where: {
      project: { ownerId: userId, ...(projectSlug ? { slug: projectSlug } : {}) },
    },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return domains.map((domain) => ({
    id: domain.id,
    name: domain.hostname,
    project: domain.project.name,
    status: domain.verified && domain.certStatus === "active" ? "Active" : "Pending",
    managed: false,
    renewalLabel: "—",
  }));
}
