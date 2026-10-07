import type {
  CheckoutSession,
  Entitlements,
  Invoice,
  PaymentLink,
  Subscription,
  UsageRecord,
  UsageSummary,
} from "./billing.types";
import { type Fetch, Http } from "./http";
import type {
  BillingConfig,
  CustomerParams,
  CustomerSessionParams,
  PaymentCheckoutParams,
  PriceParams,
  ProductParams,
  ProductUpdate,
  SubscriptionCheckoutParams,
  UsageParams,
} from "./params";
import type { Customer, CustomerSession, List, Price, Product } from "./types";
import { constructEvent, verifyWebhook } from "./webhooks";

export interface VrsPayOptions {
  /** Your VRS Pay API address. */
  apiUrl: string;
  fetch?: Fetch;
  maxRetries?: number;
}

/** VRS Pay on your server, with a secret key (sk_test_… or sk_live_…). Never ship it to browsers. */
export class VrsPay {
  private readonly http: Http;

  constructor(secretKey: string, options: VrsPayOptions) {
    if (secretKey.startsWith("pk_")) {
      throw new Error("VRS Pay: this is a publishable key. Use @vrs-pay/js in browsers.");
    }
    this.http = new Http({ apiKey: secretKey, ...options });
  }

  private get<T>(path: string, query?: Record<string, string | boolean | string[] | undefined>) {
    return this.http.request<T>("GET", path, { query });
  }

  private post<T>(path: string, body: unknown = {}, idempotencyKey?: string) {
    return this.http.request<T>("POST", path, { body, idempotencyKey });
  }

  readonly products = {
    list: (filter: { active?: boolean } = {}) => this.get<List<Product>>("/v1/products", filter),
    retrieve: (id: string) => this.get<Product>(`/v1/products/${id}`),
    create: (params: ProductParams) => this.post<Product>("/v1/products", params),
    update: (id: string, params: ProductUpdate) => this.post<Product>(`/v1/products/${id}`, params),
  };

  readonly prices = {
    /** Prices with these lookup keys, so your code needn't hard-code ids. */
    list: (filter: { lookup_keys?: string[]; active?: boolean } = {}) =>
      this.get<List<Price>>("/v1/prices", filter),
    retrieve: (id: string) => this.get<Price>(`/v1/prices/${id}`),
    create: (params: PriceParams & { product: string; transfer_lookup_key?: boolean }) =>
      this.post<Price>("/v1/prices", params),
    update: (
      id: string,
      params: { active?: boolean; nickname?: string | null; lookup_key?: string | null },
    ) => this.post<Price>(`/v1/prices/${id}`, params),
  };

  readonly customers = {
    create: (params: CustomerParams) => this.post<Customer>("/v1/customers", params),
    retrieve: (id: string) => this.get<Customer>(`/v1/customers/${id}`),
    /** By your own id for the user or org. */
    findByExternalId: (externalId: string) =>
      this.get<Customer>("/v1/customers", { external_id: externalId }),
    update: (id: string, params: Partial<Omit<CustomerParams, "external_id" | "type">>) =>
      this.post<Customer>(`/v1/customers/${id}`, params),
  };

  /** Short-lived secrets for @vrs-pay/js and @vrs-pay/react, made from your login code. */
  readonly customerSessions = {
    create: (params: CustomerSessionParams) =>
      this.post<CustomerSession>("/v1/customer_sessions", params),
  };

  readonly checkout = {
    sessions: {
      create: (
        params: PaymentCheckoutParams | SubscriptionCheckoutParams,
        idempotencyKey?: string,
      ) => this.post<CheckoutSession>("/v1/checkout/sessions", params, idempotencyKey),
      retrieve: (id: string) => this.get<CheckoutSession>(`/v1/checkout/sessions/${id}`),
    },
  };

  readonly subscriptions = {
    list: (filter: { customer?: string } = {}) =>
      this.get<List<Subscription>>("/v1/subscriptions", filter),
    retrieve: (id: string) => this.get<Subscription>(`/v1/subscriptions/${id}`),
    update: (id: string, params: { price?: string; quantity?: number }) =>
      this.post<Subscription>(`/v1/subscriptions/${id}`, params),
    cancel: (id: string, at: "period_end" | "now" = "period_end") =>
      this.post<Subscription>(`/v1/subscriptions/${id}/cancel`, { at }),
    resume: (id: string) => this.post<Subscription>(`/v1/subscriptions/${id}/resume`),
    /** Usage for a metered subscription; pass an idempotency key to make retries safe. */
    reportUsage: (id: string, params: UsageParams, idempotencyKey?: string) =>
      this.post<UsageRecord>(`/v1/subscriptions/${id}/usage_records`, params, idempotencyKey),
    usage: (id: string) => this.get<UsageSummary>(`/v1/subscriptions/${id}/usage`),
  };

  readonly invoices = {
    list: (filter: { customer?: string; subscription?: string } = {}) =>
      this.get<List<Invoice>>("/v1/invoices", filter),
    retrieve: (id: string) => this.get<Invoice>(`/v1/invoices/${id}`),
  };

  readonly entitlements = {
    retrieve: (who: { customer: string } | { external_id: string }) =>
      this.get<Entitlements>("/v1/entitlements", who),
    /** Whether the customer has `feature`: true, or a limit above zero. */
    check: async (who: { customer: string } | { external_id: string }, feature: string) =>
      (await this.get<Entitlements>("/v1/entitlements", { ...who, feature })).granted === true,
  };

  readonly paymentLinks = {
    create: (
      params:
        | { price: string; currency?: string; after_payment_url?: string }
        | { amount: number; currency: string; description: string; after_payment_url?: string },
    ) => this.post<PaymentLink>("/v1/payment_links", params),
    list: () => this.get<List<PaymentLink>>("/v1/payment_links"),
    update: (id: string, params: { active: boolean }) =>
      this.post<PaymentLink>(`/v1/payment_links/${id}`, params),
  };

  readonly billing = {
    /** Applies `vrs-pay.config.ts`; safe to run on every deploy. */
    sync: (config: BillingConfig) =>
      this.post<{ changed: boolean; created: string[]; updated: string[]; archived: string[] }>(
        "/v1/billing/sync",
        config,
      ),
  };

  readonly webhooks = { verify: verifyWebhook, constructEvent };
}
