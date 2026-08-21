/**
 * AWS Simple Email Service (SES) API v2 client + shared sender configuration.
 *
 * Configured via AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.
 */

import {
  type MessageHeader,
  SendEmailCommand,
  type SendEmailCommandInput,
  SESv2Client,
} from "@aws-sdk/client-sesv2";

const region = process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export const sesClient = new SESv2Client({
  region,
  credentials:
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined,
});

/**
 * Platform & company email addresses.
 * Configured via environment variables with defaults on multivrs.space.
 */
export const COMPANY_EMAILS = {
  /**
   * Primary catch-all address for general customer inquiries, top-of-funnel leads,
   * and general business correspondence.
   */
  contact: process.env.EMAIL_CONTACT || "Multivrs <contact@multivrs.space>",

  /**
   * Dedicated to customer service, issue resolution, and technical assistance.
   */
  support: process.env.EMAIL_SUPPORT || "Multivrs Support <support@multivrs.space>",

  /**
   * Inbound sales leads, product demo requests, and partnership queries.
   */
  sales: process.env.EMAIL_SALES || "Multivrs Sales <sales@multivrs.space>",

  /**
   * Accounts payable/receivable, invoice submissions, payment receipts, and vendor financial queries.
   */
  billing: process.env.EMAIL_BILLING || "Multivrs Billing <billing@multivrs.space>",

  /**
   * Outbound transactional emails (password resets, OTP codes, order updates, system alerts)
   * that are not monitored for incoming replies.
   */
  noreply: process.env.EMAIL_FROM || process.env.EMAIL_NOREPLY || "Multivrs <noreply@multivrs.space>",

  /**
   * Data protection officer communications, GDPR/CCPA data deletion requests, and privacy policy inquiries.
   */
  privacy: process.env.EMAIL_PRIVACY || "Multivrs Privacy <privacy@multivrs.space>",
} as const;

/**
 * Default transactional sender address (noreply).
 */
export const EMAIL_FROM = COMPANY_EMAILS.noreply;

export interface SendEmailOptions {
  from?: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | string[];
  tenantName?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: Buffer | Uint8Array;
  }>;
}

export interface SendEmailResult {
  messageId: string;
}

/**
 * Send an email via AWS SES API v2 SendEmailCommand.
 */
export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  const from = options.from || EMAIL_FROM;
  const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
  const replyToAddresses = options.replyTo
    ? Array.isArray(options.replyTo)
      ? options.replyTo
      : [options.replyTo]
    : undefined;

  const FORBIDDEN_SES_HEADERS = new Set([
    "message-id",
    "from",
    "to",
    "cc",
    "bcc",
    "subject",
    "content-type",
    "content-transfer-encoding",
    "mime-version",
  ]);

  const headerList: MessageHeader[] | undefined = options.headers
    ? Object.entries(options.headers)
        .filter(([name]) => !FORBIDDEN_SES_HEADERS.has(name.toLowerCase()))
        .map(([Name, Value]) => ({ Name, Value }))
    : undefined;


  const input: SendEmailCommandInput = {
    FromEmailAddress: from,
    Destination: {
      ToAddresses: toAddresses,
      CcAddresses: options.cc?.length ? options.cc : undefined,
      BccAddresses: options.bcc?.length ? options.bcc : undefined,
    },
    ReplyToAddresses: replyToAddresses,
    TenantName: options.tenantName,
    Content: {
      Simple: {
        Subject: {
          Data: options.subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: options.html
            ? {
                Data: options.html,
                Charset: "UTF-8",
              }
            : undefined,
          Text: options.text
            ? {
                Data: options.text,
                Charset: "UTF-8",
              }
            : undefined,
        },
        Headers: headerList,
        Attachments: options.attachments?.map((attachment) => ({
          FileName: attachment.filename,
          ContentType: attachment.contentType,
          RawContent:
            attachment.content instanceof Uint8Array
              ? attachment.content
              : new Uint8Array(attachment.content),
        })),
      },
    },
  };

  try {
    const command = new SendEmailCommand(input);
    const response = await sesClient.send(command);

    if (!response.MessageId) {
      throw new Error("AWS SES v2 did not return a message ID");
    }

    return { messageId: response.MessageId };
  } catch (error) {
    // If the send failed because the SES Tenant container is not provisioned or associated in SES,
    // gracefully retry without TenantName so the email dispatches successfully through the verified domain.
    if (
      input.TenantName &&
      error instanceof Error &&
      (error.name === "NotFoundException" ||
        error.name === "BadRequestException" ||
        /tenant|not found|does not exist/i.test(error.message))
    ) {
      const fallbackInput: SendEmailCommandInput = {
        ...input,
        TenantName: undefined,
      };
      const fallbackCommand = new SendEmailCommand(fallbackInput);
      const fallbackResponse = await sesClient.send(fallbackCommand);

      if (!fallbackResponse.MessageId) {
        throw new Error("AWS SES v2 did not return a message ID");
      }

      return { messageId: fallbackResponse.MessageId };
    }

    throw error;
  }
}
