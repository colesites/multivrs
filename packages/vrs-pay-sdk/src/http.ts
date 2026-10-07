import { errorFromResponse, VrsPayError } from "./errors";

export type Fetch = (input: string, init: RequestInit) => Promise<Response>;
export type Query = Record<string, string | number | boolean | string[] | undefined>;

export interface HttpOptions {
  apiKey: string;
  apiUrl: string;
  fetch?: Fetch;
  /** Retries after a network failure or a 5xx, with the same idempotency key. Default 1. */
  maxRetries?: number;
}

export interface RequestOptions {
  body?: unknown;
  query?: Query;
  /** Makes a POST safe to repeat. Generated for you when left out. */
  idempotencyKey?: string;
}

function urlFor(base: string, path: string, query: Query = {}): string {
  const url = new URL(`${base.replace(/\/+$/, "")}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    url.searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  return url.toString();
}

/** JSON over HTTPS with a Bearer key, VRS Pay error bodies turned into VrsPayError. */
export class Http {
  constructor(private readonly options: HttpOptions) {
    if (!options.apiKey) throw new Error("VRS Pay: pass your API key.");
    if (!options.apiUrl) throw new Error("VRS Pay: pass apiUrl, your VRS Pay API address.");
  }

  async request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const send = this.options.fetch ?? ((input: string, init: RequestInit) => fetch(input, init));
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.options.apiKey}`,
      "Content-Type": "application/json",
    };
    if (method === "POST")
      headers["Idempotency-Key"] = options.idempotencyKey ?? crypto.randomUUID();
    const init: RequestInit = {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    };
    const url = urlFor(this.options.apiUrl, path, options.query);
    const retries = this.options.maxRetries ?? 1;
    for (let attempt = 0; ; attempt += 1) {
      let response: Response;
      try {
        response = await send(url, init);
      } catch (error) {
        if (attempt < retries) continue;
        throw new VrsPayError({
          type: "api_connection_error",
          code: "network_error",
          message: error instanceof Error ? error.message : "Couldn't reach VRS Pay.",
          status: 0,
        });
      }
      if (response.status >= 500 && attempt < retries) continue;
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw errorFromResponse(response.status, body);
      return body as T;
    }
  }
}
