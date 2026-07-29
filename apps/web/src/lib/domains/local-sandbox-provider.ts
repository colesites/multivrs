import "server-only";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";
import type { DomainDnsOverview } from "@/lib/domains/dns.types";
import { OPENPROVIDER_NAMESERVERS } from "@/lib/domains/dns.types";
import {
  mutateLocalSandbox,
  readLocalSandbox,
} from "@/lib/domains/local-sandbox-store";
import type { DnsRecordInput } from "@/lib/domains/openprovider-dns-record";

const TEST_PRICE = 12;

export async function searchLocalSandbox(
  name: string,
  extensions: string[],
): Promise<DomainSearchResult[]> {
  const state = await readLocalSandbox();
  const registered = new Set(state.registrations.map((item) => item.hostname));
  return extensions.map((extension) => {
    const domain = `${name}.${extension}`;
    return {
      domain,
      available: !registered.has(domain),
      premium: false,
      price: TEST_PRICE,
      renewalPrice: TEST_PRICE,
      currency: "USD",
    };
  });
}

export async function registerLocalSandbox(hostname: string) {
  let id = 0;
  await mutateLocalSandbox((state) => {
    if (state.registrations.some((item) => item.hostname === hostname)) {
      throw new Error(`${hostname} is no longer available in the sandbox`);
    }
    id = state.nextId++;
    state.registrations.push({ id, hostname, status: "active" });
    state.zones.push({ hostname, records: [] });
  });
  return { providerDomainId: id, status: "active" };
}

export async function getLocalSandboxDns(
  hostname: string,
): Promise<DomainDnsOverview> {
  const state = await readLocalSandbox();
  const zone = state.zones.find((item) => item.hostname === hostname);
  return {
    managed: Boolean(zone),
    active: Boolean(zone),
    dnssec: false,
    delegated: Boolean(zone),
    observedNameservers: zone ? [...OPENPROVIDER_NAMESERVERS] : [],
    nameservers: OPENPROVIDER_NAMESERVERS,
    records: (zone?.records ?? []).map((record, index) => ({
      id: `${hostname}-${index}`,
      ...record,
      priority: record.priority ?? null,
    })),
  };
}

export async function createLocalSandboxZone(hostname: string): Promise<void> {
  await mutateLocalSandbox((state) => {
    if (!state.zones.some((item) => item.hostname === hostname)) {
      state.zones.push({ hostname, records: [] });
    }
  });
}

export async function addLocalSandboxRecord(
  hostname: string,
  record: DnsRecordInput,
): Promise<void> {
  await changeRecords(hostname, (records) => records.push(record));
}

export async function addLocalSandboxRecords(
  hostname: string,
  additions: DnsRecordInput[],
): Promise<void> {
  await changeRecords(hostname, (records) => records.push(...additions));
}

export async function updateLocalSandboxRecord(
  hostname: string,
  original: DnsRecordInput,
  record: DnsRecordInput,
): Promise<void> {
  await changeRecords(hostname, (records) => {
    const index = records.findIndex((item) => sameRecord(item, original));
    if (index < 0) throw new Error("DNS record not found");
    records[index] = record;
  });
}

export async function removeLocalSandboxRecord(
  hostname: string,
  record: DnsRecordInput,
): Promise<void> {
  await changeRecords(hostname, (records) => {
    const index = records.findIndex((item) => sameRecord(item, record));
    if (index < 0) throw new Error("DNS record not found");
    records.splice(index, 1);
  });
}

export async function removeLocalSandboxRecords(
  hostname: string,
  removals: DnsRecordInput[],
): Promise<void> {
  await changeRecords(hostname, (records) => {
    for (const removal of removals) {
      const index = records.findIndex((item) => sameRecord(item, removal));
      if (index >= 0) records.splice(index, 1);
    }
  });
}

async function changeRecords(
  hostname: string,
  change: (records: DnsRecordInput[]) => void,
): Promise<void> {
  await mutateLocalSandbox((state) => {
    const zone = state.zones.find((item) => item.hostname === hostname);
    if (!zone) throw new Error("DNS zone not found");
    change(zone.records);
  });
}

function sameRecord(left: DnsRecordInput, right: DnsRecordInput): boolean {
  return (
    left.name === right.name &&
    left.type === right.type &&
    left.value === right.value &&
    (left.priority ?? null) === (right.priority ?? null)
  );
}
