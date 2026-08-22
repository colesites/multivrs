import "server-only";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { type ParsedMail, simpleParser } from "mailparser";
import { logError } from "@/lib/services/logger.service";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export interface InboundAttachmentData {
  filename: string;
  contentType: string;
  size: number;
  contentBase64?: string;
  inline?: boolean;
  contentId?: string;
}

export interface ParsedInboundEmail {
  from: string;
  fromName?: string;
  to: string[];
  cc: string[];
  subject: string;
  text?: string;
  html?: string;
  messageId: string;
  inReplyTo?: string;
  references: string[];
  attachments: InboundAttachmentData[];
}

/**
 * Fetches and parses a raw inbound email file written to S3 by AWS SES.
 */
export async function readInboundEmailFromS3(
  bucketName: string,
  objectKey: string,
): Promise<ParsedInboundEmail | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });
    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error(`S3 object ${bucketName}/${objectKey} has no body`);
    }

    const bytes = await response.Body.transformToByteArray();
    const buffer = Buffer.from(bytes);
    const parsed: ParsedMail = await simpleParser(buffer);

    const fromAddress =
      parsed.from?.value?.[0]?.address ||
      (typeof parsed.from?.text === "string" ? parsed.from.text : "");
    const fromName = parsed.from?.value?.[0]?.name;

    const toAddresses: string[] = [];
    if (Array.isArray(parsed.to)) {
      for (const item of parsed.to) {
        for (const addr of item.value) {
          if (addr.address) toAddresses.push(addr.address);
        }
      }
    } else if (parsed.to?.value) {
      for (const addr of parsed.to.value) {
        if (addr.address) toAddresses.push(addr.address);
      }
    }

    const ccAddresses: string[] = [];
    if (Array.isArray(parsed.cc)) {
      for (const item of parsed.cc) {
        for (const addr of item.value) {
          if (addr.address) ccAddresses.push(addr.address);
        }
      }
    } else if (parsed.cc?.value) {
      for (const addr of parsed.cc.value) {
        if (addr.address) ccAddresses.push(addr.address);
      }
    }

    const referencesList = Array.isArray(parsed.references)
      ? parsed.references
      : parsed.references
        ? [parsed.references]
        : [];

    // Parse all attachments and embedded images
    const attachments: InboundAttachmentData[] = (parsed.attachments || []).map(
      (att, idx) => {
        const base64 = att.content ? att.content.toString("base64") : undefined;
        return {
          filename: att.filename || `attachment-${idx + 1}`,
          contentType: att.contentType || "application/octet-stream",
          size: att.size || att.content?.length || 0,
          contentBase64: base64,
          inline: Boolean(att.related || att.cid),
          contentId: att.cid || undefined,
        };
      },
    );

    let htmlContent: string | undefined =
      typeof parsed.html === "string" && parsed.html.trim().length > 0
        ? parsed.html
        : typeof parsed.textAsHtml === "string" && parsed.textAsHtml.trim().length > 0
          ? parsed.textAsHtml
          : undefined;

    // Inline embedded CID images into the HTML template with base64 data URLs
    if (htmlContent && attachments.length > 0) {
      for (const att of attachments) {
        if (att.contentId && att.contentBase64) {
          const cidRegex = new RegExp(`cid:${att.contentId.replace(/[<>]/g, "")}`, "gi");
          htmlContent = htmlContent.replace(
            cidRegex,
            `data:${att.contentType};base64,${att.contentBase64}`,
          );
        }
      }
    }

    const textContent: string | undefined =
      typeof parsed.text === "string" && parsed.text.trim().length > 0
        ? parsed.text
        : undefined;

    return {
      from: fromAddress,
      fromName: fromName || undefined,
      to: toAddresses.length ? toAddresses : [""],
      cc: ccAddresses,
      subject: parsed.subject || "(no subject)",
      text: textContent,
      html: htmlContent,
      messageId: parsed.messageId || objectKey,
      inReplyTo: parsed.inReplyTo || undefined,
      references: referencesList,
      attachments,
    };
  } catch (error) {
    logError("ses.inbound.s3_read_failed", error, { bucketName, objectKey });
    return null;
  }
}
