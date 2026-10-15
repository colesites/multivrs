export interface SendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string;
    path?: string;
    contentType?: string;
    size?: number;
  }>;
  scheduledAt?: string | Date;
  mailboxId?: string;
}

export interface SendEmailResponse {
  id: string;
  status: string;
}

export interface MailClientOptions {
  apiKey?: string;
  baseUrl?: string;
  /** Custom fetch implementation for tests or edge runtimes. */
  fetch?: typeof globalThis.fetch;
}

export class MultivrsMail {
  private apiKey: string;
  private baseUrl: string;
  private fetchFn: typeof globalThis.fetch;

  constructor(apiKeyOrOptions?: string | MailClientOptions) {
    if (typeof apiKeyOrOptions === "string") {
      this.apiKey = apiKeyOrOptions;
      this.baseUrl =
        (typeof process !== "undefined" && process.env?.MULTIVRS_API_URL) ||
        "https://multivrs.space";
      this.fetchFn = globalThis.fetch;
    } else {
      this.apiKey =
        apiKeyOrOptions?.apiKey ||
        (typeof process !== "undefined" && process.env?.MULTIVRS_API_KEY) ||
        "";
      this.baseUrl = (
        apiKeyOrOptions?.baseUrl ||
        (typeof process !== "undefined" && process.env?.MULTIVRS_API_URL) ||
        "https://multivrs.space"
      ).replace(/\/+$/, "");
      this.fetchFn = apiKeyOrOptions?.fetch || globalThis.fetch;
    }
  }

  emails = {
    send: async (
      payload: SendEmailOptions,
    ): Promise<{ data: SendEmailResponse | null; error: Error | null }> => {
      try {
        if (!this.apiKey) {
          return {
            data: null,
            error: new Error(
              "Missing Multivrs API key. Pass it to new MultivrsMail('mlv_...') or set MULTIVRS_API_KEY in environment variables.",
            ),
          };
        }

        const to = Array.isArray(payload.to) ? payload.to : [payload.to];
        const cc = payload.cc
          ? Array.isArray(payload.cc)
            ? payload.cc
            : [payload.cc]
          : undefined;
        const bcc = payload.bcc
          ? Array.isArray(payload.bcc)
            ? payload.bcc
            : [payload.bcc]
          : undefined;

        const body = {
          from: payload.from,
          to,
          cc,
          bcc,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          mailboxId: payload.mailboxId,
          scheduledAt:
            payload.scheduledAt instanceof Date
              ? payload.scheduledAt.toISOString()
              : payload.scheduledAt,
          attachments: payload.attachments ?? [],
        };

        const res = await this.fetchFn(`${this.baseUrl}/api/v1/mail/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as {
            error?: { message?: string };
            message?: string;
          };
          const message =
            errData?.error?.message ||
            errData?.message ||
            `Request failed with status ${res.status}`;
          return { data: null, error: new Error(message) };
        }

        const json = (await res.json()) as { data?: SendEmailResponse; id?: string; status?: string };
        const data: SendEmailResponse = json.data ?? {
          id: json.id ?? "",
          status: json.status ?? "queued",
        };
        return { data, error: null };
      } catch (err: unknown) {
        return {
          data: null,
          error: err instanceof Error ? err : new Error(String(err)),
        };
      }
    },
  };
}
