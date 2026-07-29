import type { MailMessageDetail } from "@/features/mail/mail.types";

function addresses(form: FormData, key: string) {
  return String(form.get(key) ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

interface EncodedAttachment {
  filename: string;
  contentType: string;
  contentBase64: string;
  size: number;
}

async function encodeAttachment(file: File): Promise<EncodedAttachment> {
  if (file.size > 5 * 1024 * 1024)
    throw new Error(`${file.name} is larger than 5 MB`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return {
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    contentBase64: btoa(binary),
    size: file.size,
  };
}

function plainText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function mailComposePayload(form: FormData, reply?: MailMessageDetail) {
  const scheduledAt = form.get("scheduledAt");
  const html = String(form.get("html") ?? "").trim();
  const text = String(form.get("text") ?? "").trim() || plainText(html);
  return {
    mailboxId: form.get("mailboxId"),
    to: addresses(form, "to"),
    cc: addresses(form, "cc"),
    bcc: addresses(form, "bcc"),
    subject: form.get("subject"),
    text,
    html: html || undefined,
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
    const payload = mailComposePayload(form, reply);
    const files = form
      .getAll("attachments")
      .filter(
        (value): value is File => value instanceof File && value.size > 0,
      );
    const attachments = await Promise.all(files.map(encodeAttachment));
    if (
      attachments.reduce((total, item) => total + item.size, 0) >
      10 * 1024 * 1024
    ) {
      throw new Error("Attachments cannot exceed 10 MB in total");
    }
    if (!payload.text)
      return { ok: false as const, message: "Write a message before sending" };
    const response = await fetch("/api/mail/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, attachments }),
    });
    return response.ok
      ? { ok: true as const }
      : { ok: false as const, message: "The message could not be queued" };
  } catch (error) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the mail service",
    };
  }
}
