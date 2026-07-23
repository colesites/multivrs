import "server-only";
import { createHmac } from "node:crypto";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import { z } from "zod";
import type { connectDomainSchema } from "@/lib/domains/dns.schemas";
import type { DomainDetail } from "@/lib/domains/dns.types";
import { isOpenproviderSandbox } from "@/lib/domains/openprovider-client";
import { getProviderDns } from "@/lib/domains/openprovider-dns";
import { prisma } from "@/lib/prisma";

type ConnectDomainInput = z.infer<typeof connectDomainSchema>;

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
    data: { hostname: input.hostname, projectId: project.id },
    include: { project: { select: { name: true, slug: true, ownerId: true } } },
  });
  return toDomainDetail(domain);
}

export async function getDomainDetail(
  userId: string,
  domainId: string,
): Promise<DomainDetail> {
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
    include: { project: { select: { name: true, slug: true, ownerId: true } } },
  });
  if (!domain || domain.project.ownerId !== userId) {
    throw new NotFoundError("Domain not found");
  }
  return toDomainDetail(domain);
}

export async function removeDomain(
  userId: string,
  domainId: string,
): Promise<void> {
  await getDomainDetail(userId, domainId);
  await prisma.domain.delete({ where: { id: domainId } });
}

export async function markDomainVerified(
  userId: string,
  domainId: string,
): Promise<boolean> {
  const domain = await getDomainDetail(userId, domainId);
  const verified = isOpenproviderSandbox()
    ? await hasSandboxVerificationRecord(domain)
    : await hasPublicVerificationRecord(domain);
  if (verified) {
    await prisma.domain.update({
      where: { id: domainId },
      data: { verified: true },
    });
  }
  return verified;
}

async function hasSandboxVerificationRecord(
  domain: DomainDetail,
): Promise<boolean> {
  const overview = await getProviderDns(domain.hostname);
  return overview.records.some(
    (record) =>
      record.type === "TXT" &&
      record.name === domain.verificationName &&
      record.value.includes(domain.verificationValue),
  );
}

async function hasPublicVerificationRecord(
  domain: DomainDetail,
): Promise<boolean> {
  const answers = await lookupTxt(domain.verificationName);
  return answers.some((answer) =>
    answer.replace(/^"|"$/g, "").includes(domain.verificationValue),
  );
}

function toDomainDetail(domain: {
  id: string;
  hostname: string;
  projectId: string;
  verified: boolean;
  certStatus: string;
  project: { name: string; slug: string; ownerId: string };
}): DomainDetail {
  const verificationName = `_multivrs.${domain.hostname}`;
  return {
    id: domain.id,
    hostname: domain.hostname,
    projectId: domain.projectId,
    projectName: domain.project.name,
    projectSlug: domain.project.slug,
    verified: domain.verified,
    certStatus: domain.certStatus,
    verificationName,
    verificationValue: verificationValue(domain.id, domain.hostname),
  };
}

function verificationValue(domainId: string, hostname: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required");
  const signature = createHmac("sha256", secret)
    .update(`${domainId}:${hostname}`)
    .digest("hex")
    .slice(0, 32);
  return `multivrs-domain-verification=${signature}`;
}

const dnsAnswerSchema = z.object({
  Answer: z
    .array(z.object({ data: z.string() }))
    .optional()
    .default([]),
});

async function lookupTxt(hostname: string): Promise<string[]> {
  const query = new URLSearchParams({ name: hostname, type: "TXT" });
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?${query}`,
    { headers: { accept: "application/dns-json" }, cache: "no-store" },
  );
  if (!response.ok) return [];
  return dnsAnswerSchema
    .parse(await response.json())
    .Answer.map((answer) => answer.data);
}
