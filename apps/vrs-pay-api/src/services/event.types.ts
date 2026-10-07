import type { ApiKeyMode, LedgerTransaction } from "@vrs-pay/core";
import type { CheckoutSession } from "./checkout-session.types";
import type { Payment } from "./payment.types";
import type { Refund } from "./refund.types";
import type { Invoice, Subscription } from "./subscription.types";

export const EVENT_TYPES = [
  "payment.succeeded",
  "refund.succeeded",
  "refund.failed",
  "checkout.session.expired",
  "subscription.created",
  "subscription.updated",
  "subscription.canceled",
  "subscription.past_due",
  "invoice.paid",
  "invoice.payment_failed",
  "entitlements.updated",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** What merchants receive on their webhook endpoints. */
export interface VrsEvent {
  id: string;
  object: "event";
  type: EventType;
  livemode: boolean;
  /** Unix seconds. */
  created: number;
  data: { object: Payment | Refund | CheckoutSession | Subscription | Invoice | Entitlements };
}

/** Everything a customer currently has, merged across their live subscriptions. */
export interface Entitlements {
  object: "entitlements";
  customer: string;
  plans: string[];
  features: Record<string, boolean | number>;
}

export interface StoredEvent {
  merchantId: string;
  mode: ApiKeyMode;
  event: VrsEvent;
}

export interface LedgerPosting {
  mode: ApiKeyMode;
  source: { type: "payment" | "refund"; id: string };
  transaction: LedgerTransaction;
}

/** Side effects a store writes in the same transaction as its main change. */
export interface Effects {
  ledger?: LedgerPosting;
  /** Also fans out a delivery to every matching webhook endpoint. */
  event?: StoredEvent;
  /** Further postings and events, written after `ledger` and `event`. */
  postings?: LedgerPosting[];
  events?: StoredEvent[];
}

export function postingsOf(effects: Effects): LedgerPosting[] {
  return [...(effects.ledger ? [effects.ledger] : []), ...(effects.postings ?? [])];
}

export function eventsOf(effects: Effects): StoredEvent[] {
  return [...(effects.event ? [effects.event] : []), ...(effects.events ?? [])];
}
