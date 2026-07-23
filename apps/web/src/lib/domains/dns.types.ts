export const DNS_RECORD_TYPES = [
  "A",
  "AAAA",
  "CAA",
  "CNAME",
  "MX",
  "NS",
  "SRV",
  "SSHFP",
  "TLSA",
  "TXT",
] as const;

export const DNS_TTL_OPTIONS = [900, 3600, 10800, 21600, 43200, 86400] as const;

export const OPENPROVIDER_NAMESERVERS = [
  "ns1.openprovider.nl",
  "ns2.openprovider.be",
  "ns3.openprovider.eu",
] as const;

export type DnsRecordType = (typeof DNS_RECORD_TYPES)[number];

export interface DnsRecord {
  id: string;
  name: string;
  type: DnsRecordType;
  value: string;
  ttl: number;
  priority: number | null;
}

export interface DomainDnsOverview {
  managed: boolean;
  active: boolean;
  dnssec: boolean;
  delegated: boolean;
  observedNameservers: string[];
  nameservers: readonly string[];
  records: DnsRecord[];
}

export interface DomainDetail {
  id: string;
  hostname: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  verified: boolean;
  certStatus: string;
  verificationName: string;
  verificationValue: string;
}
