"use client";

import type { z } from "zod";
import type {
  dnsRecordInputSchema,
  updateDnsRecordSchema,
} from "@/lib/domains/dns.schemas";
import type { DomainDnsOverview } from "@/lib/domains/dns.types";

export type DnsRecordInput = z.infer<typeof dnsRecordInputSchema>;
export type UpdateDnsRecordInput = z.infer<typeof updateDnsRecordSchema>;

interface ErrorResponse {
  error?: { message?: string };
}

export async function dnsRequest(
  domainId: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: object,
): Promise<DomainDnsOverview> {
  const response = await fetch(`/api/domains/${domainId}/dns`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse;
    throw new Error(error.error?.message ?? "DNS request failed");
  }
  return (await response.json()) as DomainDnsOverview;
}

export async function enableDns(domainId: string): Promise<DomainDnsOverview> {
  const response = await fetch(`/api/domains/${domainId}/dns/zone`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse;
    throw new Error(error.error?.message ?? "Unable to enable DNS");
  }
  return (await response.json()) as DomainDnsOverview;
}
