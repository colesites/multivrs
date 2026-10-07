import type { MerchantProfile } from "../../app.types";
import type { ProviderAccountStatus } from "../../services/account-status";
import type { CheckoutSession, StoredCheckoutSession } from "../../services/checkout-session.types";
import {
  type Effects,
  eventsOf,
  type LedgerPosting,
  postingsOf,
  type StoredEvent,
} from "../../services/event.types";
import type { StoredPayment } from "../../services/payment.types";
import type { StoredRefund } from "../../services/refund.types";
import type {
  PaymentMethodRecord,
  StoredInvoice,
  StoredSubscription,
} from "../../services/subscription.types";
import type { StoredWebhookEndpoint } from "../../services/webhook-endpoint.types";
import { endpointAccepts } from "../../services/webhook-filter";
import type { ApiKeySummary, MerchantRecord } from "../merchant.store";
import type { ProviderAccountOwner } from "../provider-account.store";

export interface MemoryDelivery {
  id: string;
  eventId: string;
  endpointId: string;
  status: "pending" | "succeeded" | "failed";
  attempts: number;
  nextAttemptAt: Date;
  lastStatusCode: number | null;
  lastError: string | null;
}

export interface MemoryAccount extends ProviderAccountOwner {
  status: ProviderAccountStatus;
}

/** Everything the in-memory stores share, so one "transaction" can touch several. */
export interface MemoryState {
  sessions: Map<string, StoredCheckoutSession>;
  payments: Map<string, StoredPayment>;
  refunds: Map<string, StoredRefund>;
  ledger: LedgerPosting[];
  events: StoredEvent[];
  endpoints: Map<string, StoredWebhookEndpoint>;
  deliveries: Map<string, MemoryDelivery>;
  /** Keyed `${provider}:${externalId}`. */
  accounts: Map<string, MemoryAccount>;
  providerEvents: Set<string>;
  subscriptions: Map<string, StoredSubscription>;
  invoices: Map<string, StoredInvoice>;
  paymentMethods: Map<string, PaymentMethodRecord>;
  /** Keyed `${customerId}:${provider}`. */
  providerCustomers: Map<string, string>;
  /** Merchant profiles for background work, keyed by merchant id. */
  merchants: Map<string, MerchantProfile>;
  merchantRecords: Map<string, MerchantRecord>;
  /** Dashboard user id → their merchant. */
  /** userId → memberships, oldest first. */
  members: Map<string, Array<{ merchantId: string; role: string }>>;
  keys: Array<ApiKeySummary & { merchantId: string }>;
}

export function createMemoryState(): MemoryState {
  return {
    sessions: new Map(),
    payments: new Map(),
    refunds: new Map(),
    ledger: [],
    events: [],
    endpoints: new Map(),
    deliveries: new Map(),
    accounts: new Map(),
    providerEvents: new Set(),
    subscriptions: new Map(),
    invoices: new Map(),
    paymentMethods: new Map(),
    providerCustomers: new Map(),
    merchants: new Map(),
    merchantRecords: new Map(),
    members: new Map(),
    keys: [],
  };
}

/** Writes ledger postings (once per source) and events plus their deliveries. */
export function applyEffects(state: MemoryState, effects: Effects): void {
  for (const posting of postingsOf(effects)) {
    const posted = state.ledger.some(
      (p) => p.source.type === posting.source.type && p.source.id === posting.source.id,
    );
    if (!posted) state.ledger.push(posting);
  }
  for (const event of eventsOf(effects)) {
    state.events.push(event);
    for (const { merchantId, mode, endpoint } of state.endpoints.values()) {
      const sameOwner = merchantId === event.merchantId && mode === event.mode;
      if (!sameOwner || endpoint.status !== "enabled") continue;
      if (!endpointAccepts(endpoint.enabled_events, event.event.type)) continue;
      const id = crypto.randomUUID();
      state.deliveries.set(id, {
        id,
        eventId: event.event.id,
        endpointId: endpoint.id,
        status: "pending",
        attempts: 0,
        nextAttemptAt: new Date(0),
        lastStatusCode: null,
        lastError: null,
      });
    }
  }
}

export function setSessionStatus(
  state: MemoryState,
  id: string,
  status: CheckoutSession["status"],
): StoredCheckoutSession | null {
  const record = state.sessions.get(id);
  if (!record) return null;
  const updated = { ...record, session: { ...record.session, status } };
  state.sessions.set(id, updated);
  return updated;
}
