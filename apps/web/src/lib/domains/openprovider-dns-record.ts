import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { DNS_RECORD_TYPES, type DnsRecord } from "@/lib/domains/dns.types";

export const providerRecordSchema = z.object({
  name: z.string().optional().default(""),
  type: z.enum(DNS_RECORD_TYPES),
  value: z.string(),
  ttl: z.coerce.number(),
  prio: z.coerce.number().optional(),
});

export interface DnsRecordInput {
  name: string;
  type: DnsRecord["type"];
  value: string;
  ttl: number;
  priority?: number | null;
}

export function toProviderRecord(record: DnsRecordInput): object {
  return {
    name: record.name === "@" ? "" : record.name,
    type: record.type,
    value: record.value,
    ttl: record.ttl,
    ...(record.priority === null || record.priority === undefined
      ? {}
      : { prio: record.priority }),
  };
}

export function toDnsRecord(
  hostname: string,
  record: z.infer<typeof providerRecordSchema>,
): DnsRecord {
  const suffix = `.${hostname}`;
  const name =
    !record.name || record.name === hostname
      ? "@"
      : record.name.endsWith(suffix)
        ? record.name.slice(0, -suffix.length)
        : record.name;
  const identity = JSON.stringify([
    name,
    record.type,
    record.value,
    record.prio,
  ]);
  return {
    id: createHash("sha256").update(identity).digest("hex").slice(0, 16),
    name,
    type: record.type,
    value: record.value,
    ttl: record.ttl,
    priority: record.prio ?? null,
  };
}
