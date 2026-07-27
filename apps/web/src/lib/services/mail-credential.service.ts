import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mailWebhookSecret } from "@/lib/mail/mail-webhook-secret";
import { assertPublicWebhookUrl } from "@/lib/mail/webhook-url";
import type {
  createMailCredentialSchema,
  createMailWebhookSchema,
} from "@/lib/schemas/mail-resource.schemas";
import { assertMailProject } from "@/lib/services/mail-access.service";

function secret(prefix: string) {
  const value = `${prefix}${randomBytes(32).toString("base64url")}`;
  return { value, hash: createHash("sha256").update(value).digest("hex") };
}

export async function createCredential(
  userId: string,
  input: z.infer<typeof createMailCredentialSchema>,
) {
  await assertMailProject(userId, input.projectId);
  const prefix = input.kind === "smtp" ? "mlv_smtp_" : `mlv_${input.mode}_`;
  const generated = secret(prefix);
  const credential = await prisma.mailCredential.create({
    data: {
      ...input,
      userId,
      prefix,
      secretHash: generated.hash,
      secretHint: `${generated.value.slice(0, 12)}…${generated.value.slice(-4)}`,
      ipRestrictions: [],
    },
  });
  return {
    credential: {
      id: credential.id,
      kind: credential.kind,
      mode: credential.mode,
      name: credential.name,
      secretHint: credential.secretHint,
      createdAt: credential.createdAt,
    },
    secret: generated.value,
    connection:
      input.kind === "smtp"
        ? {
            host: process.env.MULTIVRS_SMTP_HOST ?? "smtp.multivrs.space",
            port: 587,
            tls: true,
            username: `mlv_${credential.id}`,
          }
        : undefined,
  };
}

export async function createWebhook(
  userId: string,
  input: z.infer<typeof createMailWebhookSchema>,
) {
  await assertMailProject(userId, input.projectId);
  await assertPublicWebhookUrl(input.url);
  const id = randomUUID();
  const value = mailWebhookSecret(id);
  const endpoint = await prisma.mailWebhookEndpoint.create({
    data: {
      ...input,
      id,
      userId,
      secretHash: createHash("sha256").update(value).digest("hex"),
      secretHint: `${value.slice(0, 10)}…${value.slice(-4)}`,
    },
  });
  return {
    endpoint: {
      id: endpoint.id,
      url: endpoint.url,
      events: endpoint.events,
      enabled: endpoint.enabled,
      secretHint: endpoint.secretHint,
      createdAt: endpoint.createdAt,
    },
    secret: value,
  };
}
