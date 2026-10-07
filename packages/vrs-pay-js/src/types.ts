/** What the browser API returns. Amounts are in minor units (pence, cents, kobo). */

export type PriceInterval = "one_time" | "day" | "week" | "month" | "year";

export interface PricingPrice {
  id: string;
  amount: number;
  currency: string;
  currency_options: Record<string, { amount: number }>;
  interval: PriceInterval;
  interval_count: number;
  usage_type: "licensed" | "metered";
  lookup_key: string | null;
}

export interface PricingProduct {
  id: string;
  object: "product";
  name: string;
  description: string | null;
  images: string[];
  marketing_features: Array<{ name: string }>;
  trial_days: number;
  features: Record<string, boolean | number>;
  prices: PricingPrice[];
}

export interface Entitlements {
  object: "entitlements";
  customer: string;
  plans: string[];
  features: Record<string, boolean | number>;
  feature?: string;
  granted?: boolean;
}

export interface CustomerSubscription {
  id: string;
  status: "incomplete" | "trialing" | "active" | "past_due" | "canceled";
  plan: string;
  price: string;
  product_name: string | null;
  price_details: PricingPrice | null;
  quantity: number;
  currency: string;
  current_period_end: number | null;
  trial_end: number | null;
  cancel_at_period_end: boolean;
  pending_price: string | null;
}

export interface CustomerInvoice {
  id: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  currency: string;
  total: number;
  period_start: number;
  period_end: number;
  paid_at: number | null;
  created: number;
}

export interface CustomerOverview {
  object: "customer_overview";
  customer: { id: string; email: string | null; name: string | null };
  subscriptions: CustomerSubscription[];
  invoices: CustomerInvoice[];
  entitlements: Entitlements;
}

export interface CheckoutParams {
  price: string;
  /** One of the price's currencies; its own by default. */
  currency?: string;
  quantity?: number;
  /** Where to land after paying or giving up; the current page by default. */
  successUrl?: string;
  cancelUrl?: string;
}
