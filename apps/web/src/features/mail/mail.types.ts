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
  /** The newest message: what read, star, and archive act on from the list. */
  latestMessageId?: string;
  unread: boolean;
  starred: boolean;
  preview: string;
  correspondent: string;
  correspondentName?: string;
}

export interface MailAttachmentItem {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  contentBase64?: string;
  inline?: boolean;
  contentId?: string;
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
  /** Mailboxes only: its address, and who sees it (personal, shared, sending, no-reply). */
  address?: string;
  kind?: string;
}

/** One page of a thread list; `nextCursor` loads the page after it. */
export interface MailThreadPage {
  threads: MailThreadSummary[];
  nextCursor: string | null;
}

/** One page of the email log. */
export interface MailLogPage {
  items: MailResourceItem[];
  nextCursor: string | null;
}

/**
 * What every mail page shares and needs quickly: counts, mailboxes, and the
 * few latest conversations for the overview. Resource lists (`MailResources`)
 * stream separately; thread lists and message bodies load per view.
 */
export interface MailDashboardData {
  stats: {
    sent: number;
    received: number;
    deliveryRate: number;
    openRate: number;
    activeMailboxes: number;
    verifiedDomains: number;
    contacts: number;
  };
  folderCounts: Record<string, number>;
  mailboxes: MailboxSummary[];
  recentThreads: MailThreadSummary[];
}

/** The account's mail resources, for the resource pages and their forms. */
export interface MailResources {
  domains: MailResourceItem[];
  contacts: MailResourceItem[];
  audiences: MailResourceItem[];
  templates: MailResourceItem[];
  broadcasts: MailResourceItem[];
  automations: MailResourceItem[];
  credentials: MailResourceItem[];
  webhooks: MailResourceItem[];
}
