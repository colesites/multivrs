import type { MailMessageDetail } from "@/features/mail/mail.types";

function addresses(form: FormData, key: string) {
  return String(form.get(key) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function mailComposePayload(form: FormData, reply?: MailMessageDetail) {
  const scheduledAt = form.get("scheduledAt");
  return {
    mailboxId: form.get("mailboxId"),
    to: addresses(form, "to"),
    cc: addresses(form, "cc"),
    bcc: [],
    subject: form.get("subject"),
    text: form.get("text"),
    replyToMessageId: reply?.id,
    scheduledAt: scheduledAt
      ? new Date(String(scheduledAt)).toISOString()
      : undefined,
  };
}

export async function submitMailCompose(
  form: FormData,
  reply?: MailMessageDetail,
) {
  try {
    const response = await fetch("/api/mail/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mailComposePayload(form, reply)),
    });
    return response.ok
      ? { ok: true as const }
      : { ok: false as const, message: "The message could not be queued" };
  } catch {
    return { ok: false as const, message: "Unable to reach the mail service" };
  }
}
