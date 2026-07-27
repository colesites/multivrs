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
  managed: boolean;
  autoRenew: boolean;
  registeredAt: string;
  expiresAt: string | null;
  providerDomainId: string | null;
  projectId: string | null;
  projectName: string | null;
  projectSlug: string | null;
  verified: boolean;
  certStatus: string;
  certVerificationName: string | null;
  certVerificationValue: string | null;
  verificationName: string;
  verificationValue: string;
}
