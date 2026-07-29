import "server-only";
import { z } from "zod";
import type { DomainDnsOverview } from "@/lib/domains/dns.types";
import { OPENPROVIDER_NAMESERVERS } from "@/lib/domains/dns.types";
import { lookupDnsDelegation } from "@/lib/domains/dns-delegation";
import {
  addLocalSandboxRecord,
  addLocalSandboxRecords,
  createLocalSandboxZone,
  getLocalSandboxDns,
  removeLocalSandboxRecord,
  removeLocalSandboxRecords,
  updateLocalSandboxRecord,
} from "@/lib/domains/local-sandbox-provider";
import {
  isLocalOpenproviderSandbox,
  isOpenproviderSandbox,
  OpenproviderApiError,
  openproviderFetch,
} from "@/lib/domains/openprovider-client";
import {
  type DnsRecordInput,
  providerRecordSchema,
  toDnsRecord,
  toProviderRecord,
} from "@/lib/domains/openprovider-dns-record";

const zoneSchema = z.object({
  data: z.object({
    id: z.coerce.number(),
    active: z.union([z.boolean(), z.number()]).optional().default(true),
    dnskey: z.string().optional().default(""),
    records: z.array(providerRecordSchema).optional().default([]),
  }),
});
const domainListSchema = z.object({
  data: z.object({
    results: z.array(z.object({ id: z.coerce.number() })).default([]),
  }),
});

export async function getProviderDns(
  hostname: string,
): Promise<DomainDnsOverview> {
  if (isLocalOpenproviderSandbox()) return getLocalSandboxDns(hostname);
  const delegation = isOpenproviderSandbox()
    ? {
        delegated: true,
        observedNameservers: [...OPENPROVIDER_NAMESERVERS],
      }
    : await lookupDnsDelegation(hostname);
  try {
    const zone = await fetchZone(hostname);
    return {
      managed: true,
      active: zone.active === true || zone.active === 1,
      dnssec: Boolean(zone.dnskey),
      ...delegation,
      nameservers: OPENPROVIDER_NAMESERVERS,
      records: zone.records.map((record) => toDnsRecord(hostname, record)),
    };
  } catch (error) {
    if (isMissingZone(error)) {
      return {
        managed: false,
        active: false,
        dnssec: false,
        ...delegation,
        nameservers: OPENPROVIDER_NAMESERVERS,
        records: [],
      };
    }
    throw error;
  }
}

export async function createProviderZone(hostname: string): Promise<void> {
  if (isLocalOpenproviderSandbox()) {
    await createLocalSandboxZone(hostname);
    return;
  }
  const [name, ...extensionParts] = hostname.split(".");
  await openproviderFetch("/v1beta/dns/zones", {
    method: "POST",
    body: JSON.stringify({
      domain: { name, extension: extensionParts.join(".") },
      type: "master",
      records: [],
      secured: false,
    }),
  });
  await assignProviderNameservers(hostname);
}

export async function addProviderRecord(
  hostname: string,
  record: DnsRecordInput,
): Promise<void> {
  if (isLocalOpenproviderSandbox()) {
    await addLocalSandboxRecord(hostname, record);
    return;
  }
  await modifyZone(hostname, { add: [toProviderRecord(record)] });
}

export async function addProviderRecords(
  hostname: string,
  records: DnsRecordInput[],
): Promise<void> {
  if (!records.length) return;
  if (isLocalOpenproviderSandbox()) {
    await addLocalSandboxRecords(hostname, records);
    return;
  }
  await modifyZone(hostname, { add: records.map(toProviderRecord) });
}

export async function updateProviderRecord(
  hostname: string,
  original: DnsRecordInput,
  record: DnsRecordInput,
): Promise<void> {
  if (isLocalOpenproviderSandbox()) {
    await updateLocalSandboxRecord(hostname, original, record);
    return;
  }
  await modifyZone(hostname, {
    update: [
      {
        original_record: toProviderRecord(original),
        record: toProviderRecord(record),
      },
    ],
  });
}

export async function removeProviderRecord(
  hostname: string,
  record: DnsRecordInput,
): Promise<void> {
  if (isLocalOpenproviderSandbox()) {
    await removeLocalSandboxRecord(hostname, record);
    return;
  }
  await modifyZone(hostname, { remove: [toProviderRecord(record)] });
}

export async function removeProviderRecords(
  hostname: string,
  records: DnsRecordInput[],
): Promise<void> {
  if (!records.length) return;
  if (isLocalOpenproviderSandbox()) {
    await removeLocalSandboxRecords(hostname, records);
    return;
  }
  await modifyZone(hostname, { remove: records.map(toProviderRecord) });
}

async function modifyZone(hostname: string, records: object): Promise<void> {
  const zone = await fetchZone(hostname);
  await openproviderFetch(`/v1beta/dns/zones/${encodeURIComponent(hostname)}`, {
    method: "PUT",
    body: JSON.stringify({ id: zone.id, name: hostname, records }),
  });
}

async function fetchZone(hostname: string) {
  const response = await openproviderFetch(
    `/v1beta/dns/zones/${encodeURIComponent(hostname)}?with_records=true&with_dnskey=true`,
  );
  return zoneSchema.parse(await response.json()).data;
}

async function assignProviderNameservers(hostname: string): Promise<void> {
  const query = new URLSearchParams({ full_name: hostname, limit: "1" });
  const response = await openproviderFetch(`/v1beta/domains?${query}`);
  const domains = domainListSchema.parse(await response.json()).data.results;
  const domain = domains[0];
  if (!domain) return;
  await openproviderFetch(`/v1beta/domains/${domain.id}`, {
    method: "PUT",
    body: JSON.stringify({ ns_group: "dns-openprovider" }),
  });
}

function isMissingZone(error: unknown): boolean {
  return (
    error instanceof OpenproviderApiError &&
    (error.status === 404 || /not found|does not exist/i.test(error.message))
  );
}
