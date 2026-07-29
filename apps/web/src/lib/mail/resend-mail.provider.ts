import "server-only";
import { Resend } from "resend";
import type {
  OutboundMailMessage,
  OutboundMailProvider,
  ProviderSendResult,
} from "@/lib/mail/mail-provider.types";

export class ResendMailProvider implements OutboundMailProvider {
  readonly client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(message: OutboundMailMessage): Promise<ProviderSendResult> {
    const content =
      message.html && message.text
        ? { html: message.html, text: message.text }
        : message.html
          ? { html: message.html }
          : { text: message.text ?? "" };
    const response = await this.client.emails.send({
      from: message.from,
      to: message.to,
      cc: message.cc.length ? message.cc : undefined,
      bcc: message.bcc.length ? message.bcc : undefined,
      replyTo: message.replyTo,
      subject: message.subject,
      headers: message.headers,
      attachments: message.attachments,
      ...content,
    });
    if (response.error || !response.data?.id) {
      throw new Error(
        response.error?.message ?? "Mail provider rejected the message",
      );
    }
    return { provider: "resend", providerMessageId: response.data.id };
  }
}

export function configuredMailProvider(): OutboundMailProvider {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is required for outbound mail");
  return new ResendMailProvider(key);
}
