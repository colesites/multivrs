/**
 * Who an inbound message is for, lowercased and deduplicated.
 *
 * SES's receipt recipients are the SMTP envelope, so they include CC and
 * BCC. The To and CC headers can name people at other providers and never
 * show BCC, so they're only a fallback for payloads without an envelope.
 */
export function inboundRecipients(
  event: {
    receipt?: { recipients?: string[] };
    mail: { destination?: string[] };
  },
  headerRecipients: string[],
): string[] {
  const envelope = event.receipt?.recipients?.length
    ? event.receipt.recipients
    : (event.mail.destination ?? []);
  const source = envelope.length ? envelope : headerRecipients;
  return [...new Set(source.map(bareAddress).filter(Boolean))];
}

/** "Ada <ada@example.com>" → "ada@example.com". */
function bareAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim().toLowerCase();
}
