/** Checkout, subscriptions, invoices, usage, entitlements and events. Amounts are in minor units. */

export interface CheckoutSession {
  id: string;
  object: "checkout.session";
  status: "open" | "complete" | "expired";
  mode: "payment" | "subscription";
  customer: string | null;
  subscription: string | null;
  amount: number;
  currency: string;
  /** Send the customer here to pay. */
  url: string;
  metadata: Record<string, string>;
  created: number;
}

export type SubscriptionStatus = "incomplete" | "trialing" | "active" | "past_due" | "canceled";

export interface Subscription {
  id: string;
  object: "subscription";
  livemode: boolean;
  customer: string;
  plan: string;
  price: string;
  status: SubscriptionStatus;
  quantity: number;
  currency: string;
  current_period_start: number | null;
  current_period_end: number | null;
  trial_end: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  pending_price: string | null;
  pending_quantity: number | null;
  created: number;
}

export interface Invoice {
  id: string;
  object: "invoice";
  customer: string;
  subscription: string | null;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  currency: string;
  total: number;
  lines: Array<{ kind: string; description: string; quantity: number; amount: number }>;
  period_start: number;
  period_end: number;
  paid_at: number | null;
  created: number;
}

export interface Entitlements {
  object: "entitlements";
  customer: string;
  plans: string[];
  /** Feature key → true, or a limit. */
  features: Record<string, boolean | number>;
  feature?: string;
  granted?: boolean;
}

export interface UsageRecord {
  id: string;
  object: "usage_record";
  subscription: string;
  quantity: number;
  timestamp: number;
}

export interface UsageSummary {
  object: "usage_summary";
  subscription: string;
  period_start: number;
  period_end: number;
  aggregate_usage: "sum" | "max" | "last";
  quantity: number;
  unit_amount: number;
  currency: string;
  amount_due: number;
}

export interface PaymentLink {
  id: string;
  object: "payment_link";
  url: string;
  price: string | null;
  amount: number;
  currency: string;
  description: string;
  active: boolean;
  created: number;
}

/** What VRS Pay sends to your webhook endpoints. */
export interface VrsPayEvent<T = Record<string, unknown>> {
  id: string;
  object: "event";
  type: string;
  livemode: boolean;
  created: number;
  data: { object: T };
}
