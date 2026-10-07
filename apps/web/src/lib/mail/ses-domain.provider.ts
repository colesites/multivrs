import "server-only";

import {
  AlreadyExistsException,
  CreateEmailIdentityCommand,
  type CreateEmailIdentityCommandOutput,
  CreateTenantResourceAssociationCommand,
  DeleteEmailIdentityCommand,
  DeleteTenantResourceAssociationCommand,
  GetEmailIdentityCommand,
  PutEmailIdentityDkimAttributesCommand,
  PutEmailIdentityMailFromAttributesCommand,
} from "@aws-sdk/client-sesv2";
import { ConflictError } from "@multivrs/error-utils";
import { sesClient } from "@/lib/email/client";
import {
  MAIL_FROM_SUBDOMAIN,
  type ProviderDomainSnapshot,
  sesDomainSnapshot,
} from "@/lib/mail/ses-domain-snapshot";
import { logError } from "@/lib/services/logger.service";
import { ensureSesTenant } from "@/lib/services/ses-tenant.service";

export type {
  DomainVerificationStatus,
  ProviderDomainRecord,
  ProviderDomainSnapshot,
} from "@/lib/mail/ses-domain-snapshot";

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
      // Ensure tenant resource association and MAIL FROM
      await associateDomainToTenant(domainName, tenantName);
      await configureMailFrom(domainName);
      return existing;
    }
    throw error;
  }

  // Associate identity with tenant and configure Custom MAIL FROM
  await associateDomainToTenant(domainName, tenantName);
  await configureMailFrom(domainName);

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
 * Configures the Custom MAIL FROM domain in SES to use bounces.<domain>
 * so that bounce return-path headers show your domain instead of amazonses.com.
 */
async function configureMailFrom(domainName: string): Promise<void> {
  try {
    const command = new PutEmailIdentityMailFromAttributesCommand({
      EmailIdentity: domainName,
      MailFromDomain: `${MAIL_FROM_SUBDOMAIN}.${domainName}`,
      BehaviorOnMxFailure: "USE_DEFAULT_VALUE",
    });
    await sesClient.send(command);
  } catch (error) {
    // Non-fatal: SES will fall back to default amazonses.com MAIL FROM
    logError("ses.mail_from.configure_failed", error, { domain: domainName });
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
  return sesDomainSnapshot(domainName, sesRegion(), response);
}

/**
 * Retrieves snapshot of domain and its verification records.
 */
export async function getSesDomain(
  domainName: string,
): Promise<ProviderDomainSnapshot> {
  return verifyCustomDomain(domainName);
}

const isNotFound = (error: unknown) =>
  error instanceof Error &&
  (error.name === "NotFoundException" ||
    /not found|does not exist/i.test(error.message));

/**
 * Deletes an email identity from AWS SES v2, unlinking it from the
 * customer's tenant first. AWS's own reason is passed on if it refuses.
 */
export async function deleteCustomDomain(
  domainName: string,
  tenantName?: string,
): Promise<void> {
  if (tenantName) {
    try {
      await sesClient.send(
        new DeleteTenantResourceAssociationCommand({
          TenantName: tenantName,
          ResourceArn: emailIdentityArn(domainName),
        }),
      );
    } catch (error) {
      // Not linked (or never was): deleting the identity still works.
      if (!isNotFound(error)) {
        logError("ses.tenant.unlink_failed", error, { domain: domainName });
      }
    }
  }
  try {
    await sesClient.send(
      new DeleteEmailIdentityCommand({ EmailIdentity: domainName }),
    );
  } catch (error) {
    if (isNotFound(error)) return;
    logError("ses.identity.delete_failed", error, { domain: domainName });
    throw new ConflictError(
      `AWS couldn't remove ${domainName}: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}

/**
 * SES stops looking for the DKIM records 72 hours after the domain is added
 * and marks DKIM as failed, even if the records appear later. AWS's advice
 * is to turn DKIM signing off and on again to start a fresh check. Read the
 * identity again afterwards: if SES issued new tokens, the stored records
 * follow them.
 */
export async function restartDkimVerification(
  domainName: string,
): Promise<void> {
  for (const SigningEnabled of [false, true]) {
    await sesClient.send(
      new PutEmailIdentityDkimAttributesCommand({
        EmailIdentity: domainName,
        SigningEnabled,
      }),
    );
  }
}

/** Setting the MAIL FROM domain again makes SES look for its MX record again. */
export async function restartMailFromVerification(
  domainName: string,
): Promise<void> {
  await configureMailFrom(domainName);
}

function snapshotFromCreate(
  domain: string,
  res: CreateEmailIdentityCommandOutput,
): ProviderDomainSnapshot {
  return sesDomainSnapshot(domain, sesRegion(), {
    DkimAttributes: res.DkimAttributes,
  });
}
