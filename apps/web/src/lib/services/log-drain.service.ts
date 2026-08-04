import "server-only";
import { createHmac } from "node:crypto";
import { NotFoundError, ValidationError } from "@multivrs/error-utils";
import type { RuntimeLogLevel } from "@/features/dashboard/types/runtime-log.types";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/services/audit-event.service";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";
import {
  decryptEnvironmentValue,
  encryptEnvironmentValue,
} from "@/lib/services/environment-crypto.service";
import { getProject, type ProjectAction } from "@/lib/services/project.service";

interface DrainLog {
  level: RuntimeLogLevel;
  message: string;
  requestId?: string;
  traceId?: string;
}

export async function listLogDrains(userId: string, projectId: string) {
  await requireOwnedProject(userId, projectId);
  const drains = await prisma.projectLogDrain.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return drains.map((drain) => ({
    createdAt: drain.createdAt.toISOString(),
    enabled: drain.enabled,
    endpoint: drain.endpoint,
    id: drain.id,
    name: drain.name,
  }));
}

export async function createLogDrain(
  userId: string,
  projectId: string,
  input: { endpoint: string; name: string; secret: string },
) {
  await requireOwnedProject(userId, projectId, "update");
  const current = await prisma.projectLogDrain.count({ where: { projectId } });
  await assertResourceAvailable({
    current,
    projectId,
    resource: "log_drains",
    userId,
  });
  validateDrainUrl(input.endpoint);
  const encrypted = encryptEnvironmentValue(input.secret);
  const drain = await prisma.projectLogDrain.create({
    data: {
      encryptedSecret: encrypted.encryptedValue,
      endpoint: input.endpoint,
      name: input.name,
      projectId,
      secretAuthTag: encrypted.authTag,
      secretIv: encrypted.iv,
      userId,
    },
  });
  await recordAuditEvent({
    action: "log_drain.created",
    entityId: drain.id,
    entityType: "log_drain",
    projectId,
    userId,
  });
  return {
    enabled: drain.enabled,
    endpoint: drain.endpoint,
    id: drain.id,
    name: drain.name,
  };
}

export async function deleteLogDrain(
  userId: string,
  projectId: string,
  drainId: string,
) {
  await requireOwnedProject(userId, projectId, "update");
  const deleted = await prisma.projectLogDrain.deleteMany({
    where: { id: drainId, projectId },
  });
  if (!deleted.count) throw new NotFoundError("Log drain not found");
  await recordAuditEvent({
    action: "log_drain.deleted",
    entityId: drainId,
    entityType: "log_drain",
    projectId,
    userId,
  });
}

export async function deliverLogDrains(
  projectId: string,
  deploymentId: string,
  logs: DrainLog[],
): Promise<void> {
  const drains = await prisma.projectLogDrain.findMany({
    where: { enabled: true, projectId },
  });
  if (!drains.length) return;
  const timestamp = Math.floor(Date.now() / 1_000).toString();
  const body = JSON.stringify({ deploymentId, logs, projectId, timestamp });
  await Promise.allSettled(
    drains.map(async (drain) => {
      validateDrainUrl(drain.endpoint);
      const secret = decryptEnvironmentValue({
        authTag: drain.secretAuthTag,
        encryptedValue: drain.encryptedSecret,
        iv: drain.secretIv,
      });
      const signature = createHmac("sha256", secret)
        .update(`${timestamp}.${body}`)
        .digest("hex");
      const response = await fetch(drain.endpoint, {
        method: "POST",
        redirect: "error",
        headers: {
          "content-type": "application/json",
          "x-multivrs-signature": `v1=${signature}`,
          "x-multivrs-timestamp": timestamp,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok)
        throw new Error(`Log drain returned ${response.status}`);
    }),
  );
}

function validateDrainUrl(value: string): URL {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "0.0.0.0" ||
    hostname === "[::]" ||
    hostname === "[::1]" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
  ) {
    throw new ValidationError("Log drains require a public HTTPS hostname");
  }
  return url;
}

async function requireOwnedProject(
  userId: string,
  projectId: string,
  action: ProjectAction = "read",
) {
  await getProject(userId, projectId, action);
}
