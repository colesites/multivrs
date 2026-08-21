import "server-only";

import { sendEmail } from "@/lib/email/client";
import type {
  OutboundMailMessage,
  OutboundMailProvider,
  ProviderSendResult,
} from "@/lib/mail/mail-provider.types";

export class SesMailProvider implements OutboundMailProvider {
  readonly defaultTenantName?: string;

  constructor(defaultTenantName?: string) {
    this.defaultTenantName = defaultTenantName;
  }

  async send(
    message: OutboundMailMessage & { tenantName?: string },
  ): Promise<ProviderSendResult> {
    const tenantName = message.tenantName || this.defaultTenantName;

    const result = await sendEmail({
      from: message.from,
      to: message.to,
      cc: message.cc.length ? message.cc : undefined,
      bcc: message.bcc.length ? message.bcc : undefined,
      replyTo: message.replyTo,
      subject: message.subject,
      headers: message.headers,
      attachments: message.attachments,
      html: message.html,
      text: message.text,
      tenantName,
    });

    return {
      provider: "ses",
      providerMessageId: result.messageId,
    };
  }
}

export function configuredMailProvider(
  tenantName?: string,
): OutboundMailProvider {
  return new SesMailProvider(tenantName);
}
