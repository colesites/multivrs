import {
  Archive,
  BarChart3,
  BookOpen,
  Bot,
  ContactRound,
  FileText,
  Inbox,
  KeyRound,
  MailCheck,
  MailPlus,
  MailQuestion,
  Mails,
  Send,
  Settings2,
  ShieldAlert,
  Star,
  Tags,
  Trash2,
  UsersRound,
  Webhook,
} from "lucide-react";

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

export const MAIL_NAVIGATION = [
  { label: "Overview", view: "overview", icon: BookOpen },
  { label: "Inbox", view: "inbox", icon: Inbox, count: "inbox" },
  { label: "Starred", view: "starred", icon: Star },
  { label: "Sent", view: "sent", icon: Send, count: "sent" },
  { label: "Drafts", view: "drafts", icon: FileText, count: "drafts" },
  { label: "Archive", view: "archive", icon: Archive, count: "archive" },
  { label: "Spam", view: "spam", icon: ShieldAlert, count: "spam" },
  { label: "Trash", view: "trash", icon: Trash2, count: "trash" },
  { divider: "SEND & SCALE" },
  { label: "Email logs", view: "logs", icon: MailCheck },
  { label: "Broadcasts", view: "broadcasts", icon: Mails },
  { label: "Automations", view: "automations", icon: Bot },
  { label: "Templates", view: "templates", icon: Tags },
  { label: "Contacts", view: "contacts", icon: ContactRound },
  { label: "Audiences", view: "audiences", icon: UsersRound },
  { divider: "INFRASTRUCTURE" },
  { label: "Domains", view: "domains", icon: MailQuestion },
  { label: "Mailboxes", view: "mailboxes", icon: MailPlus },
  { label: "API & SMTP", view: "credentials", icon: KeyRound },
  { label: "Webhooks", view: "webhooks", icon: Webhook },
  { label: "Analytics", view: "analytics", icon: BarChart3 },
  { label: "Settings", view: "settings", icon: Settings2 },
] as const;
