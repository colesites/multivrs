import { z } from "zod";

export const smtpAuthSchema = z.object({
  username: z.string().min(1).max(200),
});

export const mailProviderEventSchema = z.object({
  providerEventId: z.string().min(1).max(500),
  providerMessageId: z.string().min(1).max(500),
  type: z.enum([
    "delivered",
    "opened",
    "clicked",
    "bounced",
    "complained",
    "deferred",
  ]),
  occurredAt: z.iso.datetime().optional(),
  payload: z.record(z.string(), z.json()).default({}),
});

export type MailProviderEventInput = z.infer<typeof mailProviderEventSchema>;

export const snsMessageSchema = z.object({
  Type: z.enum(["Notification", "SubscriptionConfirmation", "UnsubscribeConfirmation"]),
  MessageId: z.string().optional(),
  TopicArn: z.string().optional(),
  Subject: z.string().optional(),
  Message: z.string().optional(),
  Timestamp: z.string().optional(),
  SignatureVersion: z.string().optional(),
  Signature: z.string().optional(),
  SigningCertURL: z.string().optional(),
  SubscribeURL: z.string().optional(),
  Token: z.string().optional(),
});

export const sesEventPayloadSchema = z.object({
  eventType: z
    .enum([
      "Send",
      "Delivery",
      "Bounce",
      "Complaint",
      "Open",
      "Click",
      "Reject",
      "Rendering Failure",
      "DeliveryDelay",
      "Subscription",
      "Received",
    ])
    .optional(),
  notificationType: z.string().optional(),
  receipt: z
    .object({
      timestamp: z.string().optional(),
      processingTimeMillis: z.number().optional(),
      recipients: z.array(z.string()).optional(),
      spamVerdict: z.object({ status: z.string().optional() }).optional(),
      virusVerdict: z.object({ status: z.string().optional() }).optional(),
      spfVerdict: z.object({ status: z.string().optional() }).optional(),
      dkimVerdict: z.object({ status: z.string().optional() }).optional(),
      dmarcVerdict: z.object({ status: z.string().optional() }).optional(),
      action: z
        .object({
          type: z.string().optional(),
          topicArn: z.string().optional(),
          bucketName: z.string().optional(),
          objectKey: z.string().optional(),
          objectKeyPrefix: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  content: z.string().optional(),
  mail: z.object({

    timestamp: z.string().optional(),
    messageId: z.string(),
    source: z.string().optional(),
    sourceArn: z.string().optional(),
    sendingAccountId: z.string().optional(),
    destination: z.array(z.string()).optional(),
    headersTruncated: z.boolean().optional(),
    headers: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
    commonHeaders: z
      .object({
        from: z.array(z.string()).optional(),
        to: z.array(z.string()).optional(),
        subject: z.string().optional(),
        messageId: z.string().optional(),
      })
      .optional(),
    tags: z.record(z.string(), z.array(z.string())).optional(),
  }),
  delivery: z
    .object({
      timestamp: z.string().optional(),
      processingTimeMillis: z.number().optional(),
      recipients: z.array(z.string()).optional(),
      smtpResponse: z.string().optional(),
      reportingMTA: z.string().optional(),
    })
    .optional(),
  bounce: z
    .object({
      bounceType: z.string().optional(),
      bounceSubType: z.string().optional(),
      bouncedRecipients: z
        .array(
          z.object({
            emailAddress: z.string(),
            action: z.string().optional(),
            status: z.string().optional(),
            diagnosticCode: z.string().optional(),
          }),
        )
        .optional(),
      timestamp: z.string().optional(),
      feedbackId: z.string().optional(),
      remoteMtaIp: z.string().optional(),
      reportingMTA: z.string().optional(),
    })
    .optional(),
  complaint: z
    .object({
      complainedRecipients: z
        .array(
          z.object({
            emailAddress: z.string(),
          }),
        )
        .optional(),
      timestamp: z.string().optional(),
      feedbackId: z.string().optional(),
      userAgent: z.string().optional(),
      complaintFeedbackType: z.string().optional(),
      arrivalDate: z.string().optional(),
    })
    .optional(),
  open: z
    .object({
      timestamp: z.string().optional(),
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
    })
    .optional(),
  click: z
    .object({
      timestamp: z.string().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      link: z.string().optional(),
      linkTags: z.record(z.string(), z.array(z.string())).optional(),
    })
    .optional(),
});

export type SesEventPayload = z.infer<typeof sesEventPayloadSchema>;

export const resendDomainEventSchema = z.object({
  type: z.enum(["domain.created", "domain.updated", "domain.deleted"]),
  data: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    status: z.enum([
      "not_started",
      "pending",
      "verified",
      "partially_verified",
      "partially_failed",
      "failed",
      "temporary_failure",
    ]),
  }),
});
