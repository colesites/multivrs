import "server-only";

import {
  type DomainRecords,
  type DomainRegion,
  type DomainStatus,
  Resend,
} from "resend";
import {
  absoluteMailDnsName,
  normalizeMailDnsValue,
} from "@/lib/mail/mail-domain-dns";

export interface ProviderDomainRecord {
  name: string;
  priority: number | null;
  purpose: string;
  status: string;
  type: string;
  value: string;
}

export interface ProviderDomainSnapshot {
  id: string;
  name: string;
  records: ProviderDomainRecord[];
  region: string;
  status: DomainStatus;
}

const RESEND_REGIONS = new Set<DomainRegion>([
  "us-east-1",
  "eu-west-1",
  "sa-east-1",
  "ap-northeast-1",
]);

function configuredResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is required for mail domains");
  return new Resend(key);
}

export function verifyResendWebhook(payload: string, headers: Headers) {
  const webhookSecret = process.env.RESEND_DOMAIN_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error(
      "RESEND_DOMAIN_WEBHOOK_SECRET is required for domain webhooks",
    );
  }
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!(id && timestamp && signature)) {
    throw new Error("Resend webhook signature is missing");
  }
  return configuredResend().webhooks.verify({
    payload,
    headers: { id, timestamp, signature },
    webhookSecret,
  });
}

function configuredRegion(): DomainRegion {
  const value = process.env.RESEND_REGION as DomainRegion | undefined;
  return value && RESEND_REGIONS.has(value) ? value : "us-east-1";
}

export async function createResendDomain(
  name: string,
): Promise<ProviderDomainSnapshot> {
  const resend = configuredResend();
  const response = await resend.domains.create({
    name,
    region: configuredRegion(),
    customReturnPath: "multivrs",
    capabilities: { sending: "enabled", receiving: "disabled" },
    openTracking: false,
    clickTracking: false,
    tls: "enforced",
  });
  if (response.error) {
    const existing = await existingResendDomain(resend, name, response.error);
    if (existing) return existing;
    throw new Error(
      `Mail domain provider rejected ${name}: ${response.error.message}`,
    );
  }
  return snapshot(response.data);
}

export async function getResendDomain(
  id: string,
): Promise<ProviderDomainSnapshot> {
  const response = await configuredResend().domains.get(id);
  if (response.error) {
    throw new Error(
      `Mail domain status check failed: ${response.error.message}`,
    );
  }
  return snapshot(response.data);
}

export async function verifyResendDomain(id: string): Promise<void> {
  const response = await configuredResend().domains.verify(id);
  if (response.error) {
    throw new Error(
      `Mail domain verification failed: ${response.error.message}`,
    );
  }
}

export async function deleteResendDomain(id: string): Promise<void> {
  const response = await configuredResend().domains.remove(id);
  if (response.error && response.error.statusCode !== 404) {
    throw new Error(`Mail domain deletion failed: ${response.error.message}`);
  }
}

async function existingResendDomain(
  resend: Resend,
  name: string,
  error: { message: string },
): Promise<ProviderDomainSnapshot | null> {
  if (
    !/registered already|already (?:exists|registered)/i.test(error.message)
  ) {
    return null;
  }
  const listed = await resend.domains.list({ limit: 100 });
  if (listed.error) return null;
  const existing = listed.data.data.find((domain) => domain.name === name);
  if (!existing) return null;
  const response = await resend.domains.get(existing.id);
  return response.data ? snapshot(response.data) : null;
}

function snapshot(domain: {
  id: string;
  name: string;
  records: DomainRecords[];
  region: DomainRegion;
  status: DomainStatus;
}): ProviderDomainSnapshot {
  return {
    id: domain.id,
    name: domain.name,
    records: [
      ...domain.records.map((record) => providerRecord(domain.name, record)),
      {
        name: `_dmarc.${domain.name}`,
        priority: null,
        purpose: "dmarc",
        status: "pending",
        type: "TXT",
        value: "v=DMARC1; p=none;",
      },
    ],
    region: domain.region,
    status: domain.status,
  };
}

function providerRecord(
  domain: string,
  record: DomainRecords,
): ProviderDomainRecord {
  return {
    name: absoluteMailDnsName(domain, record.name),
    priority: "priority" in record ? (record.priority ?? null) : null,
    purpose: `${record.record.toLowerCase()}-${record.type.toLowerCase()}`,
    status: record.status,
    type: record.type,
    value: normalizeMailDnsValue(record.value),
  };
}
