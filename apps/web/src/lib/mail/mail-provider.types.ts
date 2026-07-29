export interface OutboundMailMessage {
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: Buffer;
  }>;
}

export interface ProviderSendResult {
  provider: string;
  providerMessageId: string;
}

export interface OutboundMailProvider {
  send(message: OutboundMailMessage): Promise<ProviderSendResult>;
}
