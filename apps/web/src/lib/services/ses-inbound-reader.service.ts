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

    return {
      from: fromAddress,
      fromName: fromName || undefined,
      to: toAddresses.length ? toAddresses : [""],
      cc: ccAddresses,
      subject: parsed.subject || "(no subject)",
      text: parsed.text || undefined,
      html: typeof parsed.html === "string" ? parsed.html : undefined,
      messageId: parsed.messageId || objectKey,
      inReplyTo: parsed.inReplyTo || undefined,
      references: referencesList,
    };
  } catch (error) {
    logError("ses.inbound.s3_read_failed", error, { bucketName, objectKey });
    return null;
  }
}
