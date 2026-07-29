export type MailView =
  | "overview"
  | "inbox"
  | "starred"
  | "sent"
  | "drafts"
  | "archive"
  | "spam"
  | "trash"
  | "logs"
  | "broadcasts"
  | "automations"
  | "templates"
  | "contacts"
  | "audiences"
  | "domains"
  | "mailboxes"
  | "credentials"
  | "webhooks"
  | "analytics"
  | "settings";

const MAIL_VIEWS = new Set<string>([
  "overview",
  "inbox",
  "starred",
  "sent",
  "drafts",
  "archive",
  "spam",
  "trash",
  "logs",
  "broadcasts",
  "automations",
  "templates",
  "contacts",
  "audiences",
  "domains",
  "mailboxes",
  "credentials",
  "webhooks",
  "analytics",
  "settings",
]);

export function isMailView(value: string | undefined): value is MailView {
  return value !== undefined && MAIL_VIEWS.has(value);
}

export function parseMailView(
  value: string | undefined,
  fallback: MailView = "overview",
): MailView {
  return isMailView(value) ? value : fallback;
}
