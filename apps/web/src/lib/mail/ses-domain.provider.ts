import "server-only";

import {
  AlreadyExistsException,
  CreateEmailIdentityCommand,
  type CreateEmailIdentityCommandOutput,
  CreateTenantResourceAssociationCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  type GetEmailIdentityCommandOutput,
} from "@aws-sdk/client-sesv2";
import { sesClient } from "@/lib/email/client";
import {
  absoluteMailDnsName,
  normalizeMailDnsValue,
} from "@/lib/mail/mail-domain-dns";
import { ensureSesTenant } from "@/lib/services/ses-tenant.service";

export interface ProviderDomainRecord {
  name: string;
  priority: number | null;
  purpose: string;
  status: string;
  ttl: string;
  type: string;
  value: string;
}

export type DomainVerificationStatus = "pending" | "verified" | "failed";

export interface ProviderDomainSnapshot {
  id: string;
  name: string;
  records: ProviderDomainRecord[];
  region: string;
  status: DomainVerificationStatus;
}

function sesRegion(): string {
  return process.env.AWS_REGION || "us-east-1";
}

function sesAccountId(): string {
  return process.env.AWS_ACCOUNT_ID || "*";
}

function emailIdentityArn(domainName: string): string {
  return `arn:aws:ses:${sesRegion()}:${sesAccountId()}:identity/${domainName}`;
}

/**
 * Creates and registers a custom domain with AWS SES v2, associating it
 * with the customer's SES Tenant container and returning formatted Easy DKIM DNS records.
 */
export async function addCustomDomain(
  domainName: string,
  tenantName: string,
): Promise<ProviderDomainSnapshot> {
  // Ensure tenant exists before associating resource
  await ensureSesTenant(tenantName);

  let response: CreateEmailIdentityCommandOutput;
  try {
    const createCommand = new CreateEmailIdentityCommand({
      EmailIdentity: domainName,
    });
    response = await sesClient.send(createCommand);
  } catch (error) {
    if (
      error instanceof AlreadyExistsException ||
      (error instanceof Error &&
        (error.name === "AlreadyExistsException" ||
          /already exists/i.test(error.message)))
    ) {
      // Identity already exists in SES; retrieve current snapshot
      const existing = await getSesDomain(domainName);
      // Ensure tenant resource association
      await associateDomainToTenant(domainName, tenantName);
      return existing;
    }
    throw error;
  }

  // Associate identity with tenant
  await associateDomainToTenant(domainName, tenantName);

  return snapshotFromCreate(domainName, response);
}

/**
 * Associates an SES Email Identity with an SES Tenant.
 */
async function associateDomainToTenant(
  domainName: string,
  tenantName: string,
): Promise<void> {
  try {
    const assocCommand = new CreateTenantResourceAssociationCommand({
      TenantName: tenantName,
      ResourceArn: emailIdentityArn(domainName),
    });
    await sesClient.send(assocCommand);
  } catch (error) {
    if (
      error instanceof AlreadyExistsException ||
      (error instanceof Error &&
        (error.name === "AlreadyExistsException" ||
          /already (associated|exists)/i.test(error.message)))
    ) {
      return;
    }
    // Log and continue if tenant association warning occurs
  }
}

/**
 * Checks verification status of a custom domain from AWS SES v2.
 */
export async function verifyCustomDomain(
  domainName: string,
): Promise<ProviderDomainSnapshot> {
  const command = new GetEmailIdentityCommand({
    EmailIdentity: domainName,
  });
  const response = await sesClient.send(command);
  return snapshotFromGet(domainName, response);
}

/**
 * Retrieves snapshot of domain and its verification records.
 */
export async function getSesDomain(
  domainName: string,
): Promise<ProviderDomainSnapshot> {
  return verifyCustomDomain(domainName);
}

/**
 * Deletes an email identity from AWS SES v2.
 */
export async function deleteCustomDomain(domainName: string): Promise<void> {
  try {
    const command = new DeleteEmailIdentityCommand({
      EmailIdentity: domainName,
    });
    await sesClient.send(command);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "NotFoundException" ||
        /not found|does not exist/i.test(error.message))
    ) {
      return;
    }
    throw error;
  }
}

function mapDkimStatus(status?: string): DomainVerificationStatus {
  switch (status) {
    case "SUCCESS":
      return "verified";
    case "FAILED":
    case "TEMPORARY_FAILURE":
      return "failed";
    case "PENDING":
    case "NOT_STARTED":
    default:
      return "pending";
  }
}

function buildDkimRecords(
  domain: string,
  tokens: string[] = [],
  status: DomainVerificationStatus,
): ProviderDomainRecord[] {
  return tokens.map((token, index) => ({
    name: `${token}._domainkey.${domain}`,
    priority: null,
    purpose: `dkim-${index + 1}`,
    status,
    ttl: "Auto",
    type: "CNAME",
    value: `${token}.dkim.amazonses.com`,
  }));
}

function snapshotFromCreate(
  domain: string,
  res: CreateEmailIdentityCommandOutput,
): ProviderDomainSnapshot {
  const dkimStatus = mapDkimStatus(res.DkimAttributes?.Status);
  const dkimRecords = buildDkimRecords(
    domain,
    res.DkimAttributes?.Tokens,
    dkimStatus,
  );

  return formatFullDomainSnapshot(domain, dkimRecords, dkimStatus);
}

function snapshotFromGet(
  domain: string,
  res: GetEmailIdentityCommandOutput,
): ProviderDomainSnapshot {
  const dkimStatus = mapDkimStatus(res.DkimAttributes?.Status);
  const dkimRecords = buildDkimRecords(
    domain,
    res.DkimAttributes?.Tokens,
    dkimStatus,
  );

  return formatFullDomainSnapshot(domain, dkimRecords, dkimStatus);
}

function formatFullDomainSnapshot(
  domain: string,
  dkimRecords: ProviderDomainRecord[],
  overallStatus: DomainVerificationStatus,
): ProviderDomainSnapshot {
  const region = sesRegion();
  const records: ProviderDomainRecord[] = [
    ...dkimRecords,
    {
      name: absoluteMailDnsName(domain, "multivrs"),
      priority: 10,
      purpose: "mx",
      status: overallStatus,
      ttl: "Auto",
      type: "MX",
      value: normalizeMailDnsValue(`feedback-smtp.${region}.amazonses.com`),
    },
    {
      name: absoluteMailDnsName(domain, "multivrs"),
      priority: null,
      purpose: "spf",
      status: overallStatus,
      ttl: "Auto",
      type: "TXT",
      value: "v=spf1 include:amazonses.com ~all",
    },
    {
      name: `_dmarc.${domain}`,
      priority: null,
      purpose: "dmarc",
      status: "pending",
      ttl: "Auto",
      type: "TXT",
      value: "v=DMARC1; p=none;",
    },
  ];

  return {
    id: domain,
    name: domain,
    records,
    region,
    status: overallStatus,
  };
}
