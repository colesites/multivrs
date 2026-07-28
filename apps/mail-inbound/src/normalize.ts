import type { ReceivedEmail, ReceivedEvent } from "./schemas";

function address(value: string) {
  const match = value.match(/^(?:\s*"?([^"<]*)"?\s*)?<([^>]+)>\s*$/);
  return match
    ? { name: match[1]?.trim() || undefined, address: match[2]?.trim() ?? value }
    : { address: value.trim() };
}

function header(headers: Record<string, string>, name: string) {
  const key = Object.keys(headers).find((item) => item.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : undefined;
}

function references(value: string | undefined) {
  return value?.match(/<[^>]+>/g)?.slice(0, 200) ?? [];
}

export function inboundPayload(event: ReceivedEvent, email: ReceivedEmail) {
  const headers = email.headers ?? {};
  const sender = address(header(headers, "from") ?? email.from);
  const mailbox = email.to.at(0) ?? event.data.to.at(0);
  if (!mailbox) throw new Error("Received email has no mailbox recipient");
  return {
    providerEventId: event.data.email_id,
    mailbox: address(mailbox).address,
    messageId: email.message_id ?? header(headers, "message-id") ?? crypto.randomUUID(),
    inReplyTo: header(headers, "in-reply-to"),
    references: references(header(headers, "references")),
    from: sender.address,
    fromName: sender.name,
    to: email.to.map((item) => address(item).address),
    cc: (email.cc ?? []).map((item) => address(item).address),
    subject: email.subject ?? event.data.subject ?? "(no subject)",
    text: email.text ?? undefined,
    html: email.html ?? undefined,
    headers,
  };
}
