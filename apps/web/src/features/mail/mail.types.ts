export interface MailboxSummary {
  id: string;
  address: string;
  name: string;
  kind: string;
  status: string;
}

export interface MailThreadSummary {
  id: string;
  mailboxId: string;
  subject: string;
  status: string;
  assignedTo?: string;
  lastMessageAt: string;
  unread: boolean;
  starred: boolean;
  preview: string;
  correspondent: string;
}

export interface MailAttachmentItem {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  contentBase64?: string;
}

export interface MailMessageDetail {
  id: string;
  direction: string;
  status: string;
  folder: string;
  fromName?: string;
  fromAddress: string;
  to: string[];
  cc: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: MailAttachmentItem[];
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface MailResourceItem {
  id: string;
  name: string;
  detail: string;
  status: string;
  createdAt: string;
}

export interface MailDashboardData {
  stats: {
    sent: number;
    received: number;
    deliveryRate: number;
    openRate: number;
    activeMailboxes: number;
    verifiedDomains: number;
  };
  folderCounts: Record<string, number>;
  mailboxes: MailboxSummary[];
  threads: MailThreadSummary[];
  messages: Record<string, MailMessageDetail[]>;
  resources: {
    domains: MailResourceItem[];
    contacts: MailResourceItem[];
    audiences: MailResourceItem[];
    templates: MailResourceItem[];
    broadcasts: MailResourceItem[];
    automations: MailResourceItem[];
    credentials: MailResourceItem[];
    webhooks: MailResourceItem[];
  };
}
