import "server-only";
import type { z } from "zod";
import type {
  dnsRecordInputSchema,
  updateDnsRecordSchema,
} from "@/lib/domains/dns.schemas";
import type { DomainDnsOverview } from "@/lib/domains/dns.types";
import {
  addProviderRecord,
  createProviderZone,
  getProviderDns,
  removeProviderRecord,
  updateProviderRecord,
} from "@/lib/domains/openprovider-dns";
import { getDomainDetail } from "@/lib/services/domain-management.service";

type RecordInput = z.infer<typeof dnsRecordInputSchema>;
type UpdateInput = z.infer<typeof updateDnsRecordSchema>;

export async function getDomainDns(
  userId: string,
  domainId: string,
): Promise<DomainDnsOverview> {
  const domain = await getDomainDetail(userId, domainId);
  return getProviderDns(domain.hostname);
}

export async function enableDomainDns(
  userId: string,
  domainId: string,
): Promise<DomainDnsOverview> {
  const domain = await getDomainDetail(userId, domainId);
  await createProviderZone(domain.hostname);
  await addProviderRecord(domain.hostname, {
    name: "_multivrs",
    type: "TXT",
    value: domain.verificationValue,
    ttl: 900,
    priority: null,
  });
  return getProviderDns(domain.hostname);
}

export async function addDomainDnsRecord(
  userId: string,
  domainId: string,
  input: RecordInput,
): Promise<DomainDnsOverview> {
  const domain = await getDomainDetail(userId, domainId);
  await addProviderRecord(domain.hostname, input);
  return getProviderDns(domain.hostname);
}

export async function updateDomainDnsRecord(
  userId: string,
  domainId: string,
  input: UpdateInput,
): Promise<DomainDnsOverview> {
  const domain = await getDomainDetail(userId, domainId);
  await updateProviderRecord(domain.hostname, input.original, input.record);
  return getProviderDns(domain.hostname);
}

export async function removeDomainDnsRecord(
  userId: string,
  domainId: string,
  input: RecordInput,
): Promise<DomainDnsOverview> {
  const domain = await getDomainDetail(userId, domainId);
  await removeProviderRecord(domain.hostname, input);
  return getProviderDns(domain.hostname);
}
