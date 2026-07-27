import { z } from "zod";
import { mailAddressSchema } from "@/lib/schemas/mail-message.schemas";

export const createMailboxSchema = z.object({
  address: mailAddressSchema,
  name: z.string().trim().min(1).max(120),
  kind: z.enum(["personal", "shared", "sending", "no-reply"]),
  projectId: z.uuid().optional(),
});

export const createMailDomainSchema = z.object({
  domain: z.string().trim().toLowerCase().min(3).max(253),
  kind: z.enum(["sending", "mailbox", "tracking", "return-path"]),
  projectId: z.uuid().optional(),
});

export const createMailContactSchema = z.object({
  email: mailAddressSchema,
  firstName: z.string().trim().max(120).optional(),
  lastName: z.string().trim().max(120).optional(),
  tags: z.array(z.string().trim().min(1).max(64)).max(30).default([]),
  audienceIds: z.array(z.uuid()).max(50).default([]),
});

export const createMailAudienceSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).optional(),
});

export const createMailTemplateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  projectId: z.uuid().optional(),
  subject: z.string().trim().min(1).max(998),
  previewText: z.string().trim().max(300).optional(),
  html: z.string().min(1).max(2_000_000),
  text: z.string().max(2_000_000).optional(),
  variables: z
    .array(z.string().regex(/^[a-zA-Z0-9_.]+$/))
    .max(100)
    .default([]),
});

export const createMailBroadcastSchema = z.object({
  name: z.string().trim().min(1).max(160),
  subject: z.string().trim().min(1).max(998),
  fromAddress: mailAddressSchema,
  audienceId: z.uuid(),
  templateVersionId: z.uuid().optional(),
  body: z.string().min(1).max(2_000_000),
  projectId: z.uuid().optional(),
  scheduledAt: z.iso.datetime().optional(),
});

export const createMailAutomationSchema = z.object({
  name: z.string().trim().min(1).max(160),
  projectId: z.uuid().optional(),
  trigger: z.record(z.string(), z.json()),
  steps: z.array(z.record(z.string(), z.json())).min(1).max(100),
});

export const createMailCredentialSchema = z.object({
  name: z.string().trim().min(1).max(120),
  kind: z.enum(["api", "smtp"]),
  mode: z.enum(["test", "live"]),
  projectId: z.uuid().optional(),
  permissions: z.array(z.string().min(1).max(100)).min(1).max(50),
});

export const createMailWebhookSchema = z.object({
  url: z
    .url()
    .refine((value) => value.startsWith("https://"), "HTTPS is required"),
  projectId: z.uuid().optional(),
  events: z.array(z.string().min(1).max(100)).min(1).max(50),
});
