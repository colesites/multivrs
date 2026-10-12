import { providerRequestFailed } from "@vrs-pay/core";

const BASE_URL = "https://api.paystack.co";
const TIMEOUT_MS = 20_000;

/** Every Paystack response: `status` says whether it worked, `data` is the result. */
interface Envelope<T> {
  status: boolean;
  message: string;
  data: T;
  /** List endpoints with `use_cursor=true`: the cursor for the next page. */
  meta?: { next?: string | null };
}

/** The slice of Paystack's REST API the adapter calls. Tests pass a fake. */
export interface PaystackApi {
  request<T>(method: "GET" | "POST", path: string, body?: object): Promise<T>;
  /** A GET of one page of a list, with the cursor for the next page (null on the last). */
  page<T>(path: string): Promise<{ data: T[]; next: string | null }>;
}

/** A Paystack client for one secret key (test or live). */
export function createPaystackClient(
  secretKey: string,
  doFetch: typeof fetch = fetch,
): PaystackApi {
  async function call<T>(method: "GET" | "POST", path: string, body?: object) {
    const operation = path.split("?")[0] ?? path;
    let response: Response;
    try {
      response = await doFetch(`${BASE_URL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      throw providerRequestFailed("paystack", operation, message, true);
    }
    const envelope = (await response.json().catch(() => null)) as Envelope<T> | null;
    if (!response.ok || !envelope?.status) {
      const message = envelope?.message ?? `HTTP ${response.status}`;
      throw providerRequestFailed("paystack", operation, message, response.status >= 500);
    }
    return envelope;
  }

  return {
    async request<T>(method: "GET" | "POST", path: string, body?: object): Promise<T> {
      return (await call<T>(method, path, body)).data;
    },
    async page<T>(path: string) {
      const envelope = await call<T[]>("GET", path);
      return { data: envelope.data, next: envelope.meta?.next ?? null };
    },
  };
}
