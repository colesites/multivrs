import "server-only";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import type { z } from "zod";
import type {
  assignDomainProjectSchema,
  connectDomainSchema,
} from "@/lib/domains/dns.schemas";
import type { DomainDetail } from "@/lib/domains/dns.types";
import { setProviderDomainAutoRenew } from "@/lib/domains/openprovider-domain";
import { prisma } from "@/lib/prisma";
import {
  removeDomainCertificate,
  syncDomainCertificate,
} from "@/lib/services/domain-certificate.service";
import { toDomainDetail } from "@/lib/services/domain-record";
import { hasDomainVerificationRecord } from "@/lib/services/domain-verification.service";

type ConnectDomainInput = z.infer<typeof connectDomainSchema>;
type AssignDomainProjectInput = z.infer<typeof assignDomainProjectSchema>;

export async function connectDomain(
  userId: string,
  input: ConnectDomainInput,
): Promise<DomainDetail> {
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, ownerId: userId },
    select: { id: true },
  });
  if (!project) throw new NotFoundError("Project not found");
  const existing = await prisma.domain.findUnique({
    where: { hostname: input.hostname },
  });
  if (existing) throw new ConflictError("This domain is already connected");
  const domain = await prisma.domain.create({
    data: { hostname: input.hostname, projectId: project.id, userId },
    include: { project: { select: { name: true, slug: true, ownerId: true } } },
  });
  return toDomainDetail(domain);
}

export async function getDomainDetail(
  userId: string,
  domainReference: string,
): Promise<DomainDetail> {
  const domain = await prisma.domain.findFirst({
    where: {
      userId,
      OR: [
        { id: domainReference },
        { hostname: domainReference.toLowerCase() },
      ],
    },
    include: { project: { select: { name: true, slug: true, ownerId: true } } },
  });
  if (!domain) {
    throw new NotFoundError("Domain not found");
  }
  return toDomainDetail(domain);
}

export async function removeDomain(
  userId: string,
  domainId: string,
): Promise<void> {
  await getDomainDetail(userId, domainId);
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
  const [domain, project] = await Promise.all([
    prisma.domain.findFirst({
      where: { id: domainId, userId },
      select: { id: true },
    }),
    prisma.project.findFirst({
      where: { id: input.projectId, ownerId: userId },
      select: { id: true },
    }),
  ]);
  if (!domain) throw new NotFoundError("Domain not found");
  if (!project) throw new NotFoundError("Project not found");
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
  const domain = await getDomainDetail(userId, domainId);
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
  const domain = await getDomainDetail(userId, domainId);
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
