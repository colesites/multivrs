import type { MailView } from "@/features/mail/mail-navigation";

export type CreateMailView =
  | "domains"
  | "mailboxes"
  | "contacts"
  | "audiences"
  | "templates"
  | "broadcasts"
  | "automations"
  | "credentials"
  | "webhooks";

export const resourceEndpoints: Record<CreateMailView, string> = {
  domains: "domains",
  mailboxes: "mailboxes",
  contacts: "contacts",
  audiences: "audiences",
  templates: "templates",
  broadcasts: "broadcasts",
  automations: "automations",
  credentials: "credentials",
  webhooks: "webhooks",
};

const labels: Record<CreateMailView, string> = {
  domains: "Domain",
  mailboxes: "Mailbox",
  contacts: "Contact",
  audiences: "Audience",
  templates: "Template",
  broadcasts: "Broadcast",
  automations: "Automation",
  credentials: "Credential",
  webhooks: "Webhook",
};

export function createMailLabel(view: CreateMailView) {
  return labels[view];
}

export function isCreateMailView(view: MailView): view is CreateMailView {
  return view in resourceEndpoints;
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}
function optional(form: FormData, key: string) {
  return text(form, key) || undefined;
}
function isoDate(form: FormData, key: string) {
  const value = optional(form, key);
  return value ? new Date(value).toISOString() : undefined;
}
function project(value?: string) {
  return value ? { projectId: value } : {};
}

export function resourcePayload(
  view: CreateMailView,
  form: FormData,
  projectId?: string,
): object {
  const common = project(projectId);
  if (view === "domains")
    return {
      ...common,
      domain: text(form, "domain"),
      kind: text(form, "kind") || "sending",
    };
  if (view === "mailboxes")
    return {
      ...common,
      address: text(form, "address"),
      name: text(form, "name"),
      kind: text(form, "kind") || "shared",
    };
  if (view === "contacts")
    return {
      email: text(form, "email"),
      firstName: optional(form, "firstName"),
      lastName: optional(form, "lastName"),
      tags: text(form, "tags")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      audienceIds: text(form, "audienceId") ? [text(form, "audienceId")] : [],
    };
  if (view === "audiences")
    return {
      name: text(form, "name"),
      description: optional(form, "description"),
    };
  if (view === "templates")
    return {
      ...common,
      name: text(form, "name"),
      subject: text(form, "subject"),
      html: `<div>${text(form, "body").replaceAll("\n", "<br>")}</div>`,
      text: text(form, "body"),
      variables: [],
    };
  if (view === "broadcasts")
    return {
      ...common,
      name: text(form, "name"),
      subject: text(form, "subject"),
      body: text(form, "body"),
      fromAddress: text(form, "fromAddress"),
      audienceId: text(form, "audienceId"),
      scheduledAt: isoDate(form, "scheduledAt"),
    };
  if (view === "automations")
    return {
      ...common,
      name: text(form, "name"),
      trigger: { event: text(form, "event") },
      steps: [{ type: "send_email", template: text(form, "template") }],
    };
  if (view === "credentials")
    return {
      ...common,
      name: text(form, "name"),
      kind: text(form, "kind") || "api",
      mode: text(form, "mode") || "test",
      permissions: ["mail.send", "mail.read"],
    };
  return {
    ...common,
    url: text(form, "url"),
    events: text(form, "events")
      .split(",")
      .map((event) => event.trim())
      .filter(Boolean),
  };
}
