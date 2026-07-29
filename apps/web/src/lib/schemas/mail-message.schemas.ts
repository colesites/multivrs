import { z } from "zod";

export const mailAddressSchema = z
  .email()
  .transform((value) => value.trim().toLowerCase());

export const composeMailBaseSchema = z.object({
  mailboxId: z.uuid(),
  to: z.array(mailAddressSchema).min(1).max(100),
  cc: z.array(mailAddressSchema).max(100).default([]),
  bcc: z.array(mailAddressSchema).max(100).default([]),
  subject: z.string().trim().min(1).max(998),
  text: z.string().max(2_000_000).optional(),
  html: z.string().max(2_000_000).optional(),
  replyTo: mailAddressSchema.optional(),
  replyToMessageId: z.uuid().optional(),
  scheduledAt: z.iso.datetime().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string().trim().min(1).max(255),
        contentType: z.string().trim().min(1).max(255),
        contentBase64: z.base64().max(7_000_000),
        size: z
          .number()
          .int()
          .positive()
          .max(5 * 1024 * 1024),
      }),
    )
    .max(5)
    .default([]),
});

export const composeMailSchema = composeMailBaseSchema
  .refine((value) => value.text || value.html, {
    message: "An email body is required",
  })
  .refine(
    (value) =>
      value.attachments.reduce((total, item) => total + item.size, 0) <=
      10 * 1024 * 1024,
    {
      message: "Attachments cannot exceed 10 MB in total",
      path: ["attachments"],
    },
  );

export const mailMessageActionSchema = z.object({
  action: z.enum([
    "archive",
    "inbox",
    "read",
    "unread",
    "star",
    "unstar",
    "spam",
    "trash",
    "restore",
  ]),
});

export const inboundMailSchema = z.object({
  providerEventId: z.string().min(1).max(500),
  mailbox: mailAddressSchema,
  messageId: z.string().min(1).max(998),
  inReplyTo: z.string().max(998).optional(),
  references: z.array(z.string().max(998)).max(200).default([]),
  from: mailAddressSchema,
  fromName: z.string().max(500).optional(),
  to: z.array(mailAddressSchema).min(1).max(200),
  cc: z.array(mailAddressSchema).max(200).default([]),
  subject: z.string().max(998).default("(no subject)"),
  text: z.string().max(5_000_000).optional(),
  html: z.string().max(5_000_000).optional(),
  headers: z.record(z.string(), z.string()).default({}),
  rawMimeKey: z.string().max(1_000).optional(),
});

export type ComposeMailInput = z.infer<typeof composeMailSchema>;
export type InboundMailInput = z.infer<typeof inboundMailSchema>;

export const smtpSubmissionSchema = composeMailBaseSchema
  .omit({ mailboxId: true })
  .extend({
    from: mailAddressSchema,
  })
  .refine((value) => value.text || value.html, {
    message: "An email body is required",
  });
