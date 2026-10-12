import { providerRequestFailed } from "@vrs-pay/core";

const BASE_URL = "https://api.paystack.co";
const TIMEOUT_MS = 20_000;

/** Every Paystack response: `status` says whether it worked, `data` is the result. */
interface Envelope<T> {
  status: boolean;
  message: string;
  data: T;
}

/** The slice of Paystack's REST API the adapter calls. Tests pass a fake. */
export interface PaystackApi {
  request<T>(method: "GET" | "POST", path: string, body?: object): Promise<T>;
}

/** A Paystack client for one secret key (test or live). */
export function createPaystackClient(
  secretKey: string,
  doFetch: typeof fetch = fetch,
): PaystackApi {
  return {
    async request<T>(method: "GET" | "POST", path: string, body?: object): Promise<T> {
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
      return envelope.data;
    },
  };
}
