import "server-only";
import { prisma } from "@/lib/prisma";
import { ownedOrTeamWhere } from "@/lib/services/account-access";
import { projectAccessWhere } from "@/lib/services/project-access";

export interface DashboardDomain {
  id: string;
  name: string;
  project: string;
  status: string;
  managed: boolean;
  renewalLabel: string;
  registeredLabel: string;
  autoRenew: boolean;
}

export interface DomainProjectOption {
  id: string;
  name: string;
  slug: string;
}

/** The domains of the account at `username` that the viewer can see. */
export async function dashboardDomains(
  viewerId: string,
  username: string,
  projectSlug?: string,
): Promise<DashboardDomain[]> {
  const domains = await prisma.domain.findMany({
    where: {
      user: { username },
      OR: ownedOrTeamWhere(viewerId),
      ...(projectSlug ? { project: { slug: projectSlug } } : {}),
    },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return domains.map((domain) => ({
    id: domain.id,
    name: domain.hostname,
    project: domain.project?.name ?? "Unconnected",
    status:
      domain.verified && domain.certStatus === "active" ? "Active" : "Pending",
    managed: domain.managed,
    renewalLabel: formatDomainDate(domain.expiresAt),
    registeredLabel: formatDomainDate(domain.createdAt),
    autoRenew: domain.autoRenew,
  }));
}

function formatDomainDate(value: Date | null): string {
  if (!value) return "Not available";
  return dashboardDomainDateFormatter.format(value);
}

const dashboardDomainDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Projects of the account at `username` the viewer can connect a domain to. */
export async function domainProjectOptions(
  viewerId: string,
  username: string,
  projectSlug?: string,
): Promise<DomainProjectOption[]> {
  return prisma.project.findMany({
    where: {
      owner: { username },
      OR: projectAccessWhere(viewerId),
      ...(projectSlug ? { slug: projectSlug } : {}),
    },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}
