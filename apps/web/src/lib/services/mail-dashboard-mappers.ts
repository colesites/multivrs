import type {
  MailMessageDetail,
  MailResourceItem,
} from "@/features/mail/mail.types";
import { sanitizeMailHtml } from "@/lib/mail/sanitize-html";

export function mapMessage(row: {
  id: string;
  threadId: string;
  direction: string;
  status: string;
  folder: string;
  fromName: string | null;
  fromAddress: string;
  toAddresses: string[];
  ccAddresses: string[];
  subject: string;
  textBody: string | null;
  sanitizedHtml: string | null;
  htmlBody?: string | null;
  sentAt: Date | null;
  receivedAt: Date | null;
  createdAt: Date;
  attachments?: Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number;
    contentBase64: string | null;
    inline?: boolean;
    contentId?: string | null;
  }>;
}): [string, MailMessageDetail] {
  const renderedHtml =
    (row.htmlBody ? sanitizeMailHtml(row.htmlBody) : undefined) ??
    row.sanitizedHtml ??
    undefined;

  return [
    row.threadId,
    {
      id: row.id,
      direction: row.direction,
      status: row.status,
      folder: row.folder,
      fromName: row.fromName ?? undefined,
      fromAddress: row.fromAddress,
      to: row.toAddresses,
      cc: row.ccAddresses,
      subject: row.subject,
      text: row.textBody ?? undefined,
      html: renderedHtml,
      attachments: row.attachments?.map((att) => ({
        id: att.id,
        filename: att.filename,
        contentType: att.contentType,
        size: att.size,
        contentBase64: att.contentBase64 ?? undefined,
        inline: att.inline,
        contentId: att.contentId ?? undefined,
      })),
      sentAt: row.sentAt?.toISOString(),
      receivedAt: row.receivedAt?.toISOString(),
      createdAt: row.createdAt.toISOString(),
    },
  ];
}

export function resource(
  id: string,
  name: string,
  detail: string,
  status: string,
  createdAt: Date,
): MailResourceItem {
  return { id, name, detail, status, createdAt: createdAt.toISOString() };
}
