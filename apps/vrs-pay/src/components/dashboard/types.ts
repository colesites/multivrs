/** The API shapes the dashboard reads (see apps/vrs-pay-api). */

export type AccountStatus = "setup" | "active" | "restricted";
export type StepId =
  | "product"
  | "identity"
  | "business"
  | "payout"
  | "description"
  | "website"
  | "support_email";

export type Mode = "test" | "live";
/** Registered business, or an individual / sole trader. */
export type BusinessType = "company" | "individual";

/** Which business and mode the dashboard is showing; sent with every request. */
export interface Scope {
  merchant: string | null;
  mode: Mode;
}

export interface Organization {
  id: string;
  name: string;
  role: string;
}

export interface DashboardSession {
  user: { id: string; email: string; name: string; image: string | null };
  merchant: {
    id: string;
    name: string;
    email: string;
    platform_fee_bps: number;
    /** Fixed part of our fee per currency, minor units. */
    fixed_fees: Record<string, number>;
  };
  mode: Mode;
  /** Live mode opens once every setup step is done. */
  live_unlocked: boolean;
  /** Currencies VRS Pay can charge in today; prices must use one. */
  currencies: string[];
  setup: {
    status: AccountStatus;
    completed: number;
    total: number;
    next: StepId | null;
  };
}

export interface AccountSetup {
  status: AccountStatus;
  hold_reason: string | null;
  steps: Array<{ id: StepId; done: boolean }>;
  completed: number;
  total: number;
  next: StepId | null;
  details: {
    business: {
      type: BusinessType | null;
      name: string | null;
      registration_number: string | null;
      address: {
        line1: string | null;
        line2: string | null;
        city: string | null;
        postal_code: string | null;
      };
      phone: string | null;
    };
    product_description: string | null;
    website: string | null;
    support_email: string | null;
    payout: {
      currency: string;
      account_name: string;
      bank_name: string;
      last4: string;
    } | null;
    identity: {
      country: string | null;
      id_type: string | null;
      last4: string | null;
      first_name: string | null;
      last_name: string | null;
      date_of_birth: string | null;
      status: "unverified" | "pending" | "verified" | "failed";
      reason: string | null;
      /** Where to finish a document and selfie check, while one is waiting. */
      verification_url: string | null;
    };
  };
}

export interface Balance {
  hold_days: number;
  data: Array<{ currency: string; available: number; pending: number }>;
}

export interface List<T> {
  object: "list";
  data: T[];
}

export interface Payment {
  id: string;
  status: "succeeded" | "partially_refunded" | "refunded";
  amount: number;
  amount_refunded: number;
  currency: string;
  platform_fee: number;
  provider_fee: number;
  provider: string;
  checkout_session: string | null;
  customer_email: string | null;
  created: number;
}

export interface Customer {
  id: string;
  external_id: string;
  type: "user" | "org";
  email: string | null;
  name: string | null;
  created: number;
}

export interface Subscription {
  id: string;
  customer: string;
  plan: string;
  price: string;
  status: "incomplete" | "trialing" | "active" | "past_due" | "canceled";
  quantity: number;
  /** What it charges in: the price's currency or one of its options. */
  currency: string;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  pending_price: string | null;
  created: number;
}

export interface Invoice {
  id: string;
  customer: string;
  subscription: string | null;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  billing_reason: string;
  currency: string;
  total: number;
  attempt_count: number;
  next_attempt_at: number | null;
  period_start: number;
  period_end: number;
  created: number;
}

/** How often a price charges; `interval_count` multiplies it (month × 3). */
export type PriceInterval = "one_time" | "day" | "week" | "month" | "year";

export interface Price {
  id: string;
  interval: PriceInterval;
  interval_count: number;
  currency: string;
  amount: number;
  /** Other currencies it sells in: lowercase code → amount. */
  currency_options: Record<string, { amount: number }>;
  /** Your own label for it; customers never see it. */
  nickname: string | null;
  /** A stable name to fetch it by, unique in the account. */
  lookup_key: string | null;
  active: boolean;
}

export interface ProductPrice extends Price {
  product: string;
  created: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  /** Free days before the first charge on new subscriptions. */
  trial_days: number;
  /** What subscribers get: feature key → true, or a limit. */
  features: Record<string, boolean | number>;
  images: string[];
  marketing_features: Array<{ name: string }>;
  metadata: Record<string, string>;
  /** `config` products come from vrs-pay.config.ts and are read-only here. */
  source: "config" | "dashboard";
  prices: ProductPrice[];
  created: number;
}

export interface Overview {
  currency: string;
  totals: Array<{
    currency: string;
    gross: number;
    refunded: number;
    net: number;
    platform_fees: number;
    payments: number;
  }>;
  daily: Array<{ date: string; amount: number }>;
  mrr: Array<{ currency: string; amount: number }>;
  subscriptions: {
    active: number;
    trialing: number;
    past_due: number;
    canceled_30d: number;
  };
  customers: { total: number; new_30d: number };
  recent_payments: Payment[];
}

export interface ApiKey {
  id: string;
  kind: "secret" | "publishable";
  display_prefix: string;
  created: number;
  revoked: boolean;
  secret?: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  enabled_events: string[];
  status: "enabled" | "disabled";
  created: number;
  secret?: string;
}

export interface VrsEvent {
  id: string;
  type: string;
  created: number;
  data: { object: { id?: string } };
}

export interface PaymentLink {
  id: string;
  url: string;
  price: string | null;
  interval: PriceInterval;
  interval_count: number;
  amount: number;
  currency: string;
  description: string;
  active: boolean;
  created: number;
}
