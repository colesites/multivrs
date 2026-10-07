import { errorFromResponse } from "./errors";
import type {
  CheckoutParams,
  CustomerOverview,
  CustomerSubscription,
  Entitlements,
  PricingProduct,
} from "./types";

export type Fetch = (input: string, init: RequestInit) => Promise<Response>;

export interface VrsPayClientOptions {
  /** pk_test_… or pk_live_…; safe to ship to browsers. */
  publishableKey: string;
  /** Your VRS Pay API address. */
  apiUrl: string;
  /**
   * Who the customer is: the `client_secret` your server got from
   * `customerSessions.create`, or a function that fetches a fresh one
   * (sessions last 30 minutes; a function is called again when one expires).
   * Leave it out for pages that only show pricing.
   */
  customerSession?: string | (() => Promise<string>);
  fetch?: Fetch;
}

const SESSION_HEADER = "VRS-Customer-Session";

/** VRS Pay in the browser, with a publishable key. */
export function createVrsPayClient(options: VrsPayClientOptions) {
  if (options.publishableKey.startsWith("sk_")) {
    throw new Error("VRS Pay: never put a secret key in a browser. Use your publishable key.");
  }
  const base = `${options.apiUrl.replace(/\/+$/, "")}/client/v1`;
  const send = options.fetch ?? ((input: string, init: RequestInit) => fetch(input, init));
  let session: string | null =
    typeof options.customerSession === "string" ? options.customerSession : null;

  async function sessionSecret(refresh: boolean): Promise<string | null> {
    if (typeof options.customerSession !== "function") return session;
    if (!session || refresh) session = await options.customerSession();
    return session;
  }

  async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    for (const refresh of [false, true]) {
      const secret = await sessionSecret(refresh);
      const response = await send(`${base}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${options.publishableKey}`,
          "Content-Type": "application/json",
          ...(secret ? { [SESSION_HEADER]: secret } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const json: unknown = await response.json().catch(() => null);
      if (response.ok) return json as T;
      // An expired session: fetch a fresh one once, then try again.
      const canRefresh = response.status === 401 && typeof options.customerSession === "function";
      if (!refresh && canRefresh) continue;
      throw errorFromResponse(response.status, json);
    }
    throw new Error("unreachable");
  }

  const here = () => (typeof window === "undefined" ? undefined : window.location.href);

  async function checkout(params: CheckoutParams): Promise<{ id: string; url: string }> {
    const successUrl = params.successUrl ?? here();
    const cancelUrl = params.cancelUrl ?? here();
    if (!successUrl || !cancelUrl) throw new Error("VRS Pay: pass successUrl and cancelUrl.");
    return request("POST", "/checkout", {
      price: params.price,
      currency: params.currency,
      quantity: params.quantity,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  return {
    /** Active products and prices, for a pricing table. Needs no customer. */
    pricing: async () => (await request<{ data: PricingProduct[] }>("GET", "/pricing")).data,
    /** The customer, their subscriptions, invoices and entitlements, for a portal. */
    customer: () => request<CustomerOverview>("GET", "/customer"),
    entitlements: () => request<Entitlements>("GET", "/entitlements"),
    /** Whether the customer has `feature`: true, or a limit above zero. */
    hasFeature: async (feature: string) =>
      (await request<Entitlements>("GET", `/entitlements?feature=${encodeURIComponent(feature)}`))
        .granted === true,
    checkout,
    /** Starts checkout and sends the browser to it. */
    redirectToCheckout: async (params: CheckoutParams) => {
      window.location.assign((await checkout(params)).url);
    },
    changePlan: (subscriptionId: string, price: string) =>
      request<CustomerSubscription>("POST", `/subscriptions/${subscriptionId}`, { price }),
    /** Cancels at the end of the period; access continues until then. */
    cancelSubscription: (subscriptionId: string) =>
      request<CustomerSubscription>("POST", `/subscriptions/${subscriptionId}/cancel`, {}),
    resumeSubscription: (subscriptionId: string) =>
      request<CustomerSubscription>("POST", `/subscriptions/${subscriptionId}/resume`, {}),
  };
}

export type VrsPayClient = ReturnType<typeof createVrsPayClient>;
