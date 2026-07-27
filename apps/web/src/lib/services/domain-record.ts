import { createHmac } from "node:crypto";
import type { DomainDetail } from "@/lib/domains/dns.types";

interface DomainDetailRecord {
  id: string;
  hostname: string;
  userId: string;
  projectId: string | null;
  managed: boolean;
  autoRenew: boolean;
  expiresAt: Date | null;
  providerDomainId: string | null;
  verified: boolean;
  certStatus: string;
  certVerificationName: string | null;
  certVerificationValue: string | null;
  createdAt: Date;
  project: { name: string; slug: string; ownerId: string } | null;
}

export function toDomainDetail(domain: DomainDetailRecord): DomainDetail {
  const verificationName = `_multivrs.${domain.hostname}`;
  return {
    id: domain.id,
    hostname: domain.hostname,
    managed: domain.managed,
    autoRenew: domain.autoRenew,
    registeredAt: domain.createdAt.toISOString(),
    expiresAt: domain.expiresAt?.toISOString() ?? null,
    providerDomainId: domain.providerDomainId,
    projectId: domain.projectId,
    projectName: domain.project?.name ?? null,
    projectSlug: domain.project?.slug ?? null,
    verified: domain.verified,
    certStatus: domain.certStatus,
    certVerificationName: domain.certVerificationName,
    certVerificationValue: domain.certVerificationValue,
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
