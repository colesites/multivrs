import "server-only";

import { resolveCname, resolveMx, resolveTxt } from "node:dns/promises";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import type { z } from "zod";
import { DNS_RECORD_TYPES, type DnsRecordType } from "@/lib/domains/dns.types";
import {
  addProviderRecords,
  createProviderZone,
  getProviderDns,
  removeProviderRecords,
} from "@/lib/domains/openprovider-dns";
import type { DnsRecordInput } from "@/lib/domains/openprovider-dns-record";
import {
  isMailDomainInZone,
  normalizeMailDnsValue,
  relativeMailDnsName,
} from "@/lib/mail/mail-domain-dns";
import {
  addCustomDomain,
  deleteCustomDomain,
  getSesDomain,
  type ProviderDomainRecord,
  type ProviderDomainSnapshot,
  restartDkimVerification,
  restartMailFromVerification,
  verifyCustomDomain,
} from "@/lib/mail/ses-domain.provider";
import { dnsRecordStatus } from "@/lib/mail/ses-domain-snapshot";
import { prisma } from "@/lib/prisma";
import type { createMailDomainSchema } from "@/lib/schemas/mail-resource.schemas";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";
import { logError } from "@/lib/services/logger.service";
import { assertMailProject } from "@/lib/services/mail-access.service";

type DomainInput = z.infer<typeof createMailDomainSchema>;
type DnsMode = "automatic" | "manual";
type ReconcileResult = Awaited<ReturnType<typeof verifyMailDomain>>;

export async function createMailDomain(userId: string, input: DomainInput) {
  await assertMailProject(userId, input.projectId);
  const existing = await prisma.mailDomain.findUnique({
    where: { userId_domain: { userId, domain: input.domain } },
    select: { id: true },
  });
  if (existing) throw new ConflictError("This mail domain already exists");
  const current = await prisma.mailDomain.count({ where: { userId } });
  await assertResourceAvailable({
    current,
    projectId: input.projectId,
    resource: "mail_domains",
    userId,
  });

  const [snapshot, managedZone] = await Promise.all([
    addCustomDomain(input.domain, userId),
    findManagedZone(userId, input.domain),
  ]);
  const created = await prisma.mailDomain.create({
    data: {
      ...input,
      userId,
      provider: "ses",
      providerDomainId: snapshot.id,
      region: snapshot.region,
      status: mailDomainStatus(snapshot.status),
      dnsRecords: { create: await storedRecords(snapshot.records) },
    },
    include: { dnsRecords: true },
  });

  let automaticDnsConfigured = false;
  let setupError: string | undefined;
  if (managedZone) {
    try {
      await installManagedDns(
        managedZone.hostname,
        created.id,
        snapshot.records,
      );
      automaticDnsConfigured = true;
      const verifiedSnapshot = await verifyCustomDomain(snapshot.id);
      await persistSnapshot(created.id, verifiedSnapshot);
    } catch (error) {
      setupError =
        error instanceof Error ? error.message : "Automatic DNS setup failed";
    }
  }

  const domain = await prisma.mailDomain.findUniqueOrThrow({
    where: { id: created.id },
    include: { dnsRecords: true },
  });
  return {
    ...domain,
    automaticDnsConfigured,
    dnsMode: managedZone ? ("automatic" as const) : ("manual" as const),
    setupError,
  };
}

/** What a domain needs before it can send: DKIM, the MAIL FROM MX and SPF. */
const REQUIRED_PURPOSES = /^(dkim-\d+|mx|spf)$/;

export async function verifyMailDomain(userId: string, domainId: string) {
  let domain = await ownedMailDomain(userId, domainId);
  let snapshot = domain.providerDomainId
    ? await getSesDomain(domain.providerDomainId)
    : await addCustomDomain(domain.domain, userId);

  let records = await persistSnapshot(domain.id, snapshot);
  domain = await ownedMailDomain(userId, domainId);
  const managedZone = await findManagedZone(userId, domain.domain);
  let automaticDnsConfigured = false;
  if (managedZone) {
    await installManagedDns(managedZone.hostname, domain.id, snapshot.records);
    automaticDnsConfigured = true;
  }

  if (snapshot.status !== "verified") {
    snapshot = await restartStalledChecks(
      await verifyCustomDomain(snapshot.id),
    );
    records = await persistSnapshot(domain.id, snapshot);
  }

  const status = mailDomainStatus(snapshot.status);
  const required = records.filter(({ purpose }) =>
    REQUIRED_PURPOSES.test(purpose),
  );
  const dkim = required.filter(({ purpose }) => purpose.startsWith("dkim"));
  return {
    automaticDnsConfigured,
    dnsMode: managedZone ? ("automatic" as const) : ("manual" as const),
    status,
    verified: status === "verified",
    /** Required records public DNS doesn't have yet. */
    missingRecords: required.filter((record) => record.status === "missing")
      .length,
    /** Every DKIM record is in DNS, yet SES still reports DKIM as failed. */
    stalled:
      snapshot.dkimStatus === "failed" &&
      dkim.length > 0 &&
      dkim.every((record) => record.status === "found"),
  };
}

/**
 * SES looks for the records for 72 hours, then marks them failed and stops
 * looking, even if they are added later. When public DNS has them now, ask
 * SES to check again.
 */
async function restartStalledChecks(snapshot: ProviderDomainSnapshot) {
  const inDns = async (matches: (purpose: string) => boolean) => {
    const records = snapshot.records.filter(({ purpose }) => matches(purpose));
    const found = await Promise.all(records.map(recordMatches));
    return records.length > 0 && found.every(Boolean);
  };
  const dkim =
    snapshot.dkimStatus === "failed" &&
    (await inDns((purpose) => purpose.startsWith("dkim")));
  const mailFrom =
    snapshot.mailFromStatus === "failed" &&
    (await inDns((purpose) => purpose === "mx"));
  // A restart is best effort: if SES refuses it, the refresh still reports
  // what it found, and `stalled` tells the user to add the domain again.
  const restarts = [
    dkim && restartDkimVerification(snapshot.id),
    mailFrom && restartMailFromVerification(snapshot.id),
  ].filter((restart) => restart !== false);
  if (!restarts.length) return snapshot;
  for (const outcome of await Promise.allSettled(restarts)) {
    if (outcome.status === "rejected") {
      logError("mail.domain.restart_failed", outcome.reason, {
        domain: snapshot.id,
      });
    }
  }
  return verifyCustomDomain(snapshot.id);
}

export async function mailDomainDnsMode(
  userId: string,
  domain: string,
): Promise<DnsMode> {
  return (await findManagedZone(userId, domain)) ? "automatic" : "manual";
}

export async function reconcilePendingMailDomains() {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000);
  const domains = await prisma.mailDomain.findMany({
    where: {
      AND: [
        {
          OR: [
            { provider: { not: "ses" } },
            { providerDomainId: null },
            { status: { not: "verified" } },
          ],
        },
        {
          OR: [
            { verificationCheckedAt: null },
            { verificationCheckedAt: { lte: cutoff } },
          ],
        },
      ],
    },
    orderBy: [{ verificationCheckedAt: "asc" }, { createdAt: "asc" }],
    select: { id: true, userId: true },
    take: 5,
  });
  // Provider calls stay sequential so a legacy-domain backfill cannot burst API limits.
  const settled = await reconcileSequentially(domains, cutoff);
  return {
    checked: settled.length,
    failed: settled.filter((result) => result.status === "rejected").length,
    verified: settled.filter(
      (result) => result.status === "fulfilled" && result.value.verified,
    ).length,
  };
}

async function reconcileSequentially(
  domains: Array<{ id: string; userId: string }>,
  cutoff: Date,
  index = 0,
  settled: PromiseSettledResult<ReconcileResult>[] = [],
): Promise<PromiseSettledResult<ReconcileResult>[]> {
  const domain = domains[index];
  if (!domain) return settled;
  const claimed = await prisma.mailDomain.updateMany({
    where: {
      id: domain.id,
      OR: [
        { verificationCheckedAt: null },
        { verificationCheckedAt: { lte: cutoff } },
      ],
    },
    data: { verificationCheckedAt: new Date() },
  });
  if (claimed.count) {
    try {
      settled.push({
        status: "fulfilled",
        value: await verifyMailDomain(domain.userId, domain.id),
      });
    } catch (reason) {
      settled.push({ status: "rejected", reason });
    }
  }
  return reconcileSequentially(domains, cutoff, index + 1, settled);
}

export async function refreshMailDomainFromProvider(providerDomainId: string) {
  const domain = await prisma.mailDomain.findFirst({
    where: { providerDomainId },
    select: { id: true },
  });
  if (!domain) return { matched: false };
  await persistSnapshot(domain.id, await getSesDomain(providerDomainId));
  return { matched: true };
}

export async function deleteMailDomain(userId: string, domainId: string) {
  const domain = await ownedMailDomain(userId, domainId);
  // Each account's SES tenant is named after its user id (see ensureSesTenant).
  await deleteCustomDomain(domain.providerDomainId ?? domain.domain, userId);

  const managedZone = await findManagedZone(userId, domain.domain);
  const managedRecords = domain.dnsRecords.filter(
    (record) => record.managedByMultivrs,
  );
  if (managedZone && managedRecords.length) {
    try {
      await removeManagedDns(managedZone.hostname, managedRecords);
    } catch {
      // The provider authorization has already been revoked.
    }
  }
  return prisma.mailDomain.delete({ where: { id: domain.id } });
}

async function ownedMailDomain(userId: string, domainId: string) {
  const domain = await prisma.mailDomain.findFirst({
    where: { id: domainId, userId },
    include: { dnsRecords: true },
  });
  if (!domain) throw new NotFoundError("Mail domain not found");
  return domain;
}

async function persistSnapshot(
  domainId: string,
  snapshot: ProviderDomainSnapshot,
) {
  const current = await prisma.mailDnsRecord.findMany({
    where: { domainId, managedByMultivrs: true },
    select: { name: true, priority: true, type: true, value: true },
  });
  const managed = new Set(current.map(recordIdentity));
  const records = await storedRecords(snapshot.records, managed);
  await prisma.mailDomain.update({
    where: { id: domainId },
    data: {
      provider: "ses",
      providerDomainId: snapshot.id,
      region: snapshot.region,
      status: mailDomainStatus(snapshot.status),
      verificationCheckedAt: new Date(),
      dnsRecords: { deleteMany: {}, create: records },
    },
  });
  return records;
}

async function storedRecords(
  records: ProviderDomainRecord[],
  managed = new Set<string>(),
) {
  return Promise.all(
    records.map(async (record) => ({
      ...record,
      managedByMultivrs: managed.has(recordIdentity(record)),
      status: dnsRecordStatus(record, await recordMatches(record)),
    })),
  );
}

async function installManagedDns(
  zone: string,
  domainId: string,
  records: ProviderDomainRecord[],
) {
  let overview = await getProviderDns(zone);
  if (!overview.managed) {
    await createProviderZone(zone);
    overview = await getProviderDns(zone);
  }

  const desired = records.map((record) => ({
    input: toDnsInput(zone, record),
    record,
  }));
  const additions = desired.filter(({ input, record }) => {
    const recordsAtName = overview.records.filter(
      (existing) => existing.name === input.name,
    );
    if (
      record.purpose === "dmarc" &&
      recordsAtName.some(
        (existing) =>
          existing.type === "TXT" && /^v=DMARC1\s*;/i.test(existing.value),
      )
    ) {
      return false;
    }
    if (recordsAtName.some((existing) => sameDnsRecord(existing, input))) {
      return false;
    }
    const cnameConflict = recordsAtName.some(
      (existing) => existing.type === "CNAME" || input.type === "CNAME",
    );
    if (cnameConflict) {
      throw new ConflictError(
        `DNS record ${record.name} conflicts with an existing record`,
      );
    }
    return true;
  });

  await addProviderRecords(
    zone,
    additions.map(({ input }) => input),
  );
  if (additions.length) {
    await prisma.mailDnsRecord.updateMany({
      where: {
        domainId,
        OR: additions.map(({ record }) => ({
          name: record.name,
          priority: record.priority,
          type: record.type,
          value: record.value,
        })),
      },
      data: { managedByMultivrs: true },
    });
  }
}

async function removeManagedDns(
  zone: string,
  records: Array<{
    name: string;
    priority: number | null;
    ttl: string;
    type: string;
    value: string;
  }>,
) {
  const overview = await getProviderDns(zone);
  if (!overview.managed) return;
  const desired = records.map((record) => toDnsInput(zone, record));
  const installed = desired.filter((record) =>
    overview.records.some((existing) => sameDnsRecord(existing, record)),
  );
  await removeProviderRecords(zone, installed);
}

async function findManagedZone(userId: string, domain: string) {
  const domains = await prisma.domain.findMany({
    where: { userId, managed: true },
    select: { hostname: true },
  });
  return domains
    .filter((candidate) => isMailDomainInZone(domain, candidate.hostname))
    .sort((left, right) => right.hostname.length - left.hostname.length)[0];
}

function toDnsInput(
  zone: string,
  record: {
    name: string;
    priority: number | null;
    ttl: string;
    type: string;
    value: string;
  },
): DnsRecordInput {
  if (!DNS_RECORD_TYPES.includes(record.type as DnsRecordType)) {
    throw new Error(`Unsupported DNS record type: ${record.type}`);
  }
  return {
    name: relativeMailDnsName(zone, record.name),
    priority: record.priority,
    ttl: numericMailDnsTtl(record.ttl),
    type: record.type as DnsRecordType,
    value: normalizeMailDnsValue(record.value),
  };
}

function numericMailDnsTtl(ttl: string) {
  const parsed = Number(ttl);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 3600;
}

function sameDnsRecord(
  left: { name: string; priority: number | null; type: string; value: string },
  right: DnsRecordInput,
) {
  return (
    left.name === right.name &&
    left.type === right.type &&
    normalizeMailDnsValue(left.value) === normalizeMailDnsValue(right.value) &&
    (left.priority ?? null) === (right.priority ?? null)
  );
}

async function recordMatches(record: ProviderDomainRecord) {
  try {
    if (record.type === "TXT") {
      const values = (await resolveTxt(record.name)).map((parts) =>
        parts.join(""),
      );
      if (record.purpose === "dmarc") {
        return values.some((value) => /^v=DMARC1\s*;/i.test(value));
      }
      if (record.purpose === "bimi") {
        return values.some((value) => /^v=BIMI1\s*;/i.test(value));
      }
      return values.some(
        (value) =>
          normalizeMailDnsValue(value) === normalizeMailDnsValue(record.value),
      );
    }
    if (record.type === "CNAME") {
      const values = await resolveCname(record.name);
      return values.some(
        (value) =>
          normalizeMailDnsValue(value) === normalizeMailDnsValue(record.value),
      );
    }
    if (record.type === "MX") {
      const values = await resolveMx(record.name);
      return values.some(
        (value) =>
          normalizeMailDnsValue(value.exchange) ===
            normalizeMailDnsValue(record.value) &&
          value.priority === record.priority,
      );
    }
    return false;
  } catch {
    return false;
  }
}

function recordIdentity(record: {
  name: string;
  priority: number | null;
  type: string;
  value: string;
}) {
  return JSON.stringify([
    record.name,
    record.type,
    normalizeMailDnsValue(record.value),
    record.priority,
  ]);
}

function mailDomainStatus(status: ProviderDomainSnapshot["status"]) {
  return status === "verified"
    ? "verified"
    : status === "failed"
      ? "failed"
      : "pending";
}
