import "server-only";

import {
  AlreadyExistsException,
  CreateTenantCommand,
  DeleteTenantCommand,
  GetTenantCommand,
  type TenantSuppressionAttributes,
} from "@aws-sdk/client-sesv2";
import { sesClient } from "@/lib/email/client";
import { logError, logInfo } from "@/lib/services/logger.service";

const TENANT_SUPPRESSION_CONFIG: TenantSuppressionAttributes = {
  SuppressionScope: "TENANT",
  SuppressedReasons: ["BOUNCE", "COMPLAINT"],
};

/**
 * Creates an SES Tenant container with isolated tenant-level suppression.
 */
export async function createSesTenant(tenantName: string): Promise<void> {
  try {
    const command = new CreateTenantCommand({
      TenantName: tenantName,
      SuppressionAttributes: TENANT_SUPPRESSION_CONFIG,
    });
    await sesClient.send(command);
    logInfo("ses.tenant.created", { tenantName });
  } catch (error) {
    if (
      error instanceof AlreadyExistsException ||
      (error instanceof Error &&
        (error.name === "AlreadyExistsException" ||
          /already exists/i.test(error.message)))
    ) {
      // Tenant already exists; treat as success.
      return;
    }
    logError("ses.tenant.create_failed", error, { tenantName });
    throw error;
  }
}

/**
 * Ensures an SES Tenant container exists for the given identifier.
 */
export async function ensureSesTenant(tenantName: string): Promise<void> {
  if (!tenantName) return;
  try {
    const getCommand = new GetTenantCommand({ TenantName: tenantName });
    await sesClient.send(getCommand);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "NotFoundException" ||
        /not found|does not exist/i.test(error.message))
    ) {
      await createSesTenant(tenantName);
      return;
    }
    // Attempt creation if get fails for any other reason as fallback
    try {
      await createSesTenant(tenantName);
    } catch {
      // If creation also fails, log but allow callers to proceed
      logError("ses.tenant.ensure_failed", error, { tenantName });
    }
  }
}

/**
 * Deletes an SES Tenant container when a user or team is removed.
 */
export async function deleteSesTenant(tenantName: string): Promise<void> {
  try {
    const command = new DeleteTenantCommand({ TenantName: tenantName });
    await sesClient.send(command);
    logInfo("ses.tenant.deleted", { tenantName });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "NotFoundException" ||
        /not found|does not exist/i.test(error.message))
    ) {
      return;
    }
    logError("ses.tenant.delete_failed", error, { tenantName });
  }
}
