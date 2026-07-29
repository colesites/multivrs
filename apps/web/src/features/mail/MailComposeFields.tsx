import { Input } from "@/components/ui/input";
import { MailAttachmentPicker } from "@/features/mail/MailAttachmentPicker";
import { ComposeField } from "@/features/mail/MailFormControls";
import { MailRichEditor } from "@/features/mail/MailRichEditor";
import type {
  MailboxSummary,
  MailMessageDetail,
} from "@/features/mail/mail.types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function forwardedBody(message?: MailMessageDetail) {
  if (!message) return "";
  const body = message.html ?? `<p>${escapeHtml(message.text ?? "")}</p>`;
  return `<p><br></p><p>---------- Forwarded message ----------</p><p>From: ${escapeHtml(message.fromName || message.fromAddress)} &lt;${escapeHtml(message.fromAddress)}&gt;<br>Subject: ${escapeHtml(message.subject)}</p>${body}`;
}

export function MailComposeFields({
  forward,
  mailboxes,
  reply,
}: {
  forward?: MailMessageDetail;
  mailboxes: MailboxSummary[];
  reply?: MailMessageDetail;
}) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
      {!mailboxes.length ? (
        <p className="rounded-lg border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs text-amber-100">
          Create a mailbox and verify its domain before sending.
        </p>
      ) : null}
      <ComposeField label="From">
        <select
          className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm outline-hidden"
          defaultValue={mailboxes[0]?.id}
          name="mailboxId"
          required
        >
          {mailboxes.map((mailbox) => (
            <option key={mailbox.id} value={mailbox.id}>
              {mailbox.name} &lt;{mailbox.address}&gt;
            </option>
          ))}
        </select>
      </ComposeField>
      <ComposeField label="To">
        <Input
          defaultValue={reply?.fromAddress}
          name="to"
          placeholder="person@example.com, teammate@example.com"
          required
        />
      </ComposeField>
      <div className="grid gap-4 md:grid-cols-2">
        <ComposeField label="Cc">
          <Input name="cc" placeholder="Optional" />
        </ComposeField>
        <ComposeField label="Bcc">
          <Input name="bcc" placeholder="Optional" />
        </ComposeField>
      </div>
      <ComposeField label="Subject">
        <Input
          defaultValue={
            reply
              ? `Re: ${reply.subject}`
              : forward
                ? `Fwd: ${forward.subject}`
                : ""
          }
          name="subject"
          required
        />
      </ComposeField>
      <ComposeField label="Message">
        <MailRichEditor initialHtml={forwardedBody(forward)} />
      </ComposeField>
      <MailAttachmentPicker />
      <ComposeField label="Schedule">
        <Input name="scheduledAt" type="datetime-local" />
      </ComposeField>
    </div>
  );
}
