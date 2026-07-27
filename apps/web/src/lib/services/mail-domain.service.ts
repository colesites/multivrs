import "server-only";
import { createHash } from "node:crypto";
import { resolveCname, resolveMx, resolveTxt } from "node:dns/promises";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { createMailDomainSchema } from "@/lib/schemas/mail-resource.schemas";
import { assertMailProject } from "@/lib/services/mail-access.service";

type DomainInput = z.infer<typeof createMailDomainSchema>;

function verificationRecords(domain: string) {
  const token = createHash("sha256")
    .update(`${domain}:multivrs-mail`)
    .digest("hex")
    .slice(0, 32);
  const base = process.env.MULTIVRS_MAIL_DNS_DOMAIN ?? "mail.multivrs.space";
  return [
    {
      purpose: "ownership",
      type: "TXT",
      name: `_multivrs.${domain}`,
      value: `multivrs-verification=${token}`,
    },
    {
      purpose: "spf",
      type: "TXT",
      name: domain,
      value: `v=spf1 include:spf.${base} ~all`,
    },
    {
      purpose: "dkim",
      type: "CNAME",
      name: `mlv1._domainkey.${domain}`,
      value: `${token}.dkim.${base}`,
    },
    {
      purpose: "dmarc",
      type: "TXT",
      name: `_dmarc.${domain}`,
      value: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`,
    },
    {
      purpose: "mx",
      type: "MX",
      name: domain,
      value: `inbound.${base}`,
      priority: 10,
    },
    {
      purpose: "tracking",
      type: "CNAME",
      name: `track.${domain}`,
      value: `tracking.${base}`,
    },
    {
      purpose: "return-path",
      type: "CNAME",
      name: `bounce.${domain}`,
      value: `return.${base}`,
    },
  ];
}

export async function createMailDomain(userId: string, input: DomainInput) {
  await assertMailProject(userId, input.projectId);
  return prisma.mailDomain.create({
    data: {
      ...input,
      userId,
      dnsRecords: { create: verificationRecords(input.domain) },
    },
    include: { dnsRecords: true },
  });
}

async function recordMatches(record: {
  type: string;
  name: string;
  value: string;
  priority: number | null;
}) {
  try {
    if (record.type === "TXT") {
      const values = (await resolveTxt(record.name)).map((parts) =>
        parts.join(""),
      );
      return values.includes(record.value);
    }
    if (record.type === "CNAME") {
      const values = await resolveCname(record.name);
      return values.some((value) => value.replace(/\.$/, "") === record.value);
    }
    const values = await resolveMx(record.name);
    return values.some(
      (value) =>
        value.exchange.replace(/\.$/, "") === record.value &&
        value.priority === record.priority,
    );
  } catch {
    return false;
  }
}

export async function verifyMailDomain(userId: string, domainId: string) {
  const domain = await prisma.mailDomain.findFirst({
    where: { id: domainId, userId },
    include: { dnsRecords: true },
  });
  if (!domain) throw new Error("Mail domain not found");
  const matches = await Promise.all(domain.dnsRecords.map(recordMatches));
  const required = new Set(["ownership", "spf", "dkim", "mx"]);
  const allResolved = matches.length === domain.dnsRecords.length;
  const verified =
    allResolved &&
    domain.dnsRecords.every(
      (record, index) => !required.has(record.purpose) || matches[index],
    );
  await prisma.$transaction([
    ...domain.dnsRecords.map((record, index) =>
      prisma.mailDnsRecord.update({
        where: { id: record.id },
        data: { status: matches[index] ? "verified" : "missing" },
      }),
    ),
    prisma.mailDomain.update({
      where: { id: domain.id },
      data: {
        status: verified ? "verified" : "pending",
        verificationCheckedAt: new Date(),
      },
    }),
  ]);
  return { verified };
}
