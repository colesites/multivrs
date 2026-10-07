import type { ApiKeyMode, ProviderId } from "@vrs-pay/core";

export type SubscriptionStatus = "incomplete" | "trialing" | "active" | "past_due" | "canceled";
/** How often a recurring price charges; `interval_count` multiplies it. */
export type BillingInterval = "day" | "week" | "month" | "year";

/** The public shape of a subscription. */
export interface Subscription {
  id: string;
  object: "subscription";
  livemode: boolean;
  customer: string;
  plan: string;
  price: string;
  status: SubscriptionStatus;
  /** Seats for org plans; 1 otherwise. */
  quantity: number;
  /** What it charges in (lowercase): the price's currency or one of its options. */
  currency: string;
  current_period_start: number | null;
  current_period_end: number | null;
  trial_end: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  /** A downgrade that applies when the period ends. */
  pending_price: string | null;
  pending_quantity: number | null;
  payment_method: string | null;
  created: number;
}

export interface StoredSubscription {
  merchantId: string;
  mode: ApiKeyMode;
  provider: ProviderId;
  /** Optimistic lock: a write only applies to the version it read. */
  version: number;
  /**
   * Metered only: unbilled usage starts here, not at the period start,
   * when an earlier period's usage was below the minimum charge.
   */
  usageFrom?: number | null;
  subscription: Subscription;
}

export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";
/** Why the invoice exists: the first period, a renewal, or a mid-period change. */
export type BillingReason = "subscription_create" | "subscription_cycle" | "subscription_update";

export interface InvoiceLine {
  kind: "subscription" | "proration" | "usage" | "tax";
  description: string;
  quantity: number;
  /** Line total, minor units. */
  amount: number;
  period_start: number;
  period_end: number;
}

export interface Invoice {
  id: string;
  object: "invoice";
  livemode: boolean;
  customer: string;
  subscription: string | null;
  status: InvoiceStatus;
  billing_reason: BillingReason;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  lines: InvoiceLine[];
  period_start: number;
  period_end: number;
  attempt_count: number;
  next_attempt_at: number | null;
  payment: string | null;
  paid_at: number | null;
  created: number;
}

export interface StoredInvoice {
  merchantId: string;
  mode: ApiKeyMode;
  invoice: Invoice;
}

/** A saved card the engine can charge off-session. */
export interface PaymentMethodRecord {
  id: string;
  customerId: string;
  provider: ProviderId;
  providerRef: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
}
