import "server-only";
import { z } from "zod";
import type { DomainDetail } from "@/lib/domains/dns.types";
import { isOpenproviderSandbox } from "@/lib/domains/openprovider-client";
import { getProviderDns } from "@/lib/domains/openprovider-dns";

const dnsAnswerSchema = z.object({
  Answer: z
    .array(z.object({ data: z.string() }))
    .optional()
    .default([]),
});

export async function hasDomainVerificationRecord(
  domain: DomainDetail,
): Promise<boolean> {
  return isOpenproviderSandbox()
    ? hasSandboxVerificationRecord(domain)
    : hasPublicVerificationRecord(domain);
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
  const query = new URLSearchParams({
    name: domain.verificationName,
    type: "TXT",
  });
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?${query}`,
    {
      headers: { accept: "application/dns-json" },
      cache: "no-store",
    },
  );
  if (!response.ok) return false;
  return dnsAnswerSchema
    .parse(await response.json())
    .Answer.some((answer) =>
      answer.data.replace(/^"|"$/g, "").includes(domain.verificationValue),
    );
}
