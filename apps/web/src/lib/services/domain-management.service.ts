import "server-only";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@multivrs/error-utils";
import type { z } from "zod";
import type {
  assignDomainProjectSchema,
  connectDomainSchema,
} from "@/lib/domains/dns.schemas";
import type { DomainDetail } from "@/lib/domains/dns.types";
import { setProviderDomainAutoRenew } from "@/lib/domains/openprovider-domain";
import { prisma } from "@/lib/prisma";
import {
  type AccountAction,
  accountRole,
  accountRoleSelect,
  canAccount,
  ownedOrTeamWhere,
} from "@/lib/services/account-access";
import {
  removeDomainCertificate,
  syncDomainCertificate,
} from "@/lib/services/domain-certificate.service";
import { toDomainDetail } from "@/lib/services/domain-record";
import { hasDomainVerificationRecord } from "@/lib/services/domain-verification.service";
import { getProject } from "@/lib/services/project.service";

type ConnectDomainInput = z.infer<typeof connectDomainSchema>;
type AssignDomainProjectInput = z.infer<typeof assignDomainProjectSchema>;

/** Connects a hostname to a project; it belongs to the project's account. */
export async function connectDomain(
  userId: string,
  input: ConnectDomainInput,
): Promise<DomainDetail> {
  const project = await getProject(userId, input.projectId, "update");
  const existing = await prisma.domain.findUnique({
    where: { hostname: input.hostname },
  });
  if (existing) throw new ConflictError("This domain is already connected");
  const domain = await prisma.domain.create({
    data: {
      hostname: input.hostname,
      projectId: project.id,
      userId: project.ownerId,
    },
    include: { project: { select: { name: true, slug: true, ownerId: true } } },
  });
  return toDomainDetail(domain);
}

/**
 * A domain the user owns, or one on an account whose team they're on, if
 * their role allows `action`.
 */
export async function getDomainDetail(
  userId: string,
  domainReference: string,
  action: AccountAction = "read",
): Promise<DomainDetail> {
  const domain = await prisma.domain.findFirst({
    where: {
      AND: [
        {
          OR: [
            { id: domainReference },
            { hostname: domainReference.toLowerCase() },
          ],
        },
        { OR: ownedOrTeamWhere(userId) },
      ],
    },
    include: {
      project: { select: { name: true, slug: true, ownerId: true } },
      user: { select: accountRoleSelect(userId) },
    },
  });
  const role = domain ? accountRole(userId, domain) : undefined;
  if (!domain || !role) {
    throw new NotFoundError("Domain not found");
  }
  if (!canAccount(role, action)) {
    throw new ForbiddenError("Your team role can't change this domain");
  }
  return toDomainDetail(domain);
}

export async function removeDomain(
  userId: string,
  domainId: string,
): Promise<void> {
  await getDomainDetail(userId, domainId, "delete");
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
    select: { edgeHostnameId: true },
  });
  await removeDomainCertificate(domain?.edgeHostnameId);
  await prisma.domain.delete({ where: { id: domainId } });
}

export async function assignDomainProject(
  userId: string,
  domainId: string,
  input: AssignDomainProjectInput,
): Promise<DomainDetail> {
  await getDomainDetail(userId, domainId, "manage");
  const domain = await prisma.domain.findUniqueOrThrow({
    where: { id: domainId },
    select: { id: true, userId: true },
  });
  // Only the domain's own account's projects, ones the user can change.
  const project = await getProject(userId, input.projectId, "update");
  if (project.ownerId !== domain.userId) {
    throw new NotFoundError("Project not found");
  }
  const updated = await prisma.domain.update({
    where: { id: domain.id },
    data: { projectId: project.id },
    include: { project: { select: { name: true, slug: true, ownerId: true } } },
  });
  if (updated.verified) await syncDomainCertificate(updated.id);
  return getDomainDetail(userId, updated.id);
}

export async function updateDomainAutoRenew(
  userId: string,
  domainId: string,
  autoRenew: boolean,
): Promise<DomainDetail> {
  const domain = await getDomainDetail(userId, domainId, "billing");
  if (domain.managed) {
    await setProviderDomainAutoRenew(domain.hostname, autoRenew);
  }
  const updated = await prisma.domain.update({
    where: { id: domain.id },
    data: { autoRenew },
    include: { project: { select: { name: true, slug: true, ownerId: true } } },
  });
  return toDomainDetail(updated);
}

export async function markDomainVerified(
  userId: string,
  domainId: string,
): Promise<boolean> {
  const domain = await getDomainDetail(userId, domainId, "manage");
  const verified = await hasDomainVerificationRecord(domain);
  if (verified) {
    await prisma.domain.update({
      where: { id: domainId },
      data: { verified: true },
    });
    try {
      await syncDomainCertificate(domainId);
    } catch {
      await prisma.domain.update({
        where: { id: domainId },
        data: { certStatus: "error" },
      });
    }
  }
  return verified;
}
