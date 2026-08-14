"use client";

import {
  AudienceChoice,
  FormArea,
  FormChoice,
  FormField,
} from "@/features/mail/MailFormControls";
import type { MailDashboardData } from "@/features/mail/mail.types";
import type { CreateMailView } from "@/features/mail/mail-resource-form";

export function MailCreateFields({
  data,
  view,
}: {
  data: MailDashboardData;
  view: CreateMailView;
}) {
  if (view === "domains")
    return (
      <div className="space-y-4">
        <FormField name="domain" placeholder="example.com" />
        <input name="kind" type="hidden" value="sending" />
        <div className="rounded-xl border border-purple-400/15 bg-purple-400/4.5 px-4 py-3 text-xs leading-5 text-black/50 dark:text-white/50">
          If Multivrs manages this domain, email DNS records are installed
          automatically. Otherwise, you will receive records to add at your
          current DNS provider.
        </div>
      </div>
    );
  if (view === "mailboxes")
    return (
      <>
        <FormField name="name" placeholder="Support" />
        <FormField
          name="address"
          placeholder="support@example.com"
          type="email"
        />
        <FormChoice
          name="kind"
          options={["shared", "personal", "sending", "no-reply"]}
        />
      </>
    );
  if (view === "contacts")
    return (
      <>
        <FormField name="email" placeholder="person@example.com" type="email" />
        <FormField name="firstName" placeholder="First name" />
        <FormField name="lastName" placeholder="Last name" required={false} />
        <FormField
          name="tags"
          placeholder="customer, newsletter"
          required={false}
        />
        <AudienceChoice data={data} optional />
      </>
    );
  if (view === "audiences")
    return (
      <>
        <FormField name="name" placeholder="Product updates" />
        <FormField
          name="description"
          placeholder="Who belongs in this audience?"
          required={false}
        />
      </>
    );
  if (view === "templates")
    return (
      <>
        <FormField name="name" placeholder="Welcome email" />
        <FormField name="subject" placeholder="Welcome to Multivrs" />
        <FormArea name="body" placeholder="Write the reusable email body…" />
      </>
    );
  if (view === "broadcasts")
    return (
      <>
        <FormField name="name" placeholder="July launch" />
        <FormField name="subject" placeholder="What we shipped" />
        <FormField
          name="fromAddress"
          placeholder="team@example.com"
          type="email"
        />
        <AudienceChoice data={data} />
        <FormArea name="body" placeholder="Write the campaign email…" />
        <FormField name="scheduledAt" required={false} type="datetime-local" />
      </>
    );
  if (view === "automations")
    return (
      <>
        <FormField name="name" placeholder="Welcome sequence" />
        <FormField name="event" placeholder="contact.created" />
        <FormField name="template" placeholder="Welcome template" />
      </>
    );
  if (view === "credentials")
    return (
      <>
        <FormField name="name" placeholder="Production API" />
        <FormChoice name="kind" options={["api", "smtp"]} />
        <FormChoice name="mode" options={["test", "live"]} />
      </>
    );
  return (
    <>
      <FormField
        name="url"
        placeholder="https://example.com/webhooks/mail"
        type="url"
      />
      <FormField name="events" placeholder="email.delivered, email.bounced" />
    </>
  );
}
