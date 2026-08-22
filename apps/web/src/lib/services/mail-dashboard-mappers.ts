import type {
  MailMessageDetail,
  MailResourceItem,
  MailThreadSummary,
} from "@/features/mail/mail.types";

interface ThreadRow {
  id: string;
  mailboxId: string;
  subject: string;
  status: string;
  lastMessageAt: Date;
  assignedTo: { name: string } | null;
  messages: Array<{
    fromAddress: string;
    textBody: string | null;
    isRead: boolean;
    isStarred: boolean;
  }>;
}

export function mapThread(row: ThreadRow): MailThreadSummary {
  const latest = row.messages[0];
  return {
    id: row.id,
    mailboxId: row.mailboxId,
    subject: row.subject,
    status: row.status,
    assignedTo: row.assignedTo?.name,
    lastMessageAt: row.lastMessageAt.toISOString(),
    unread: latest ? !latest.isRead : false,
    starred: latest?.isStarred ?? false,
    preview: latest?.textBody?.slice(0, 180) ?? "No message preview",
    correspondent: latest?.fromAddress ?? "Unknown sender",
  };
}

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
  sentAt: Date | null;
  receivedAt: Date | null;
  createdAt: Date;
  attachments?: Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number;
    contentBase64: string | null;
  }>;
}): [string, MailMessageDetail] {
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
      html: row.sanitizedHtml ?? undefined,
      attachments: row.attachments?.map((att) => ({
        id: att.id,
        filename: att.filename,
        contentType: att.contentType,
        size: att.size,
        contentBase64: att.contentBase64 ?? undefined,
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
