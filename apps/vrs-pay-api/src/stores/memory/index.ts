import { createMemoryIdempotencyStore } from "@vrs-pay/core";
import type { Stores } from "../stores.types";
import { createMemoryProviderAccountStore, createMemoryProviderEventStore } from "./accounts";
import { createMemoryApiKeyStore, type MemoryApiKeyStore } from "./api-keys";
import { createMemoryBillingStore } from "./billing";
import { createMemoryCatalogStore } from "./catalog";
import { createMemoryCheckoutSessionStore } from "./checkout-sessions";
import { createMemoryCustomerStore } from "./customers";
import { createMemoryEventStore } from "./events";
import { createMemoryLedgerStore } from "./ledger";
import { createMemoryMerchantStore } from "./merchants";
import { createMemoryOnboardingStore } from "./onboarding";
import { createMemoryPaymentLinkStore } from "./payment-links";
import { createMemoryPaymentStore } from "./payments";
import { createMemoryRefundStore } from "./refunds";
import { createMemoryState, type MemoryState } from "./state";
import { createMemoryDeliveryStore, createMemoryWebhookEndpointStore } from "./webhooks";

export interface MemoryStores extends Stores {
  apiKeys: MemoryApiKeyStore;
  state: MemoryState;
}

/** What deleting a customer cascades to in the database. */
function removeCustomerRecords(state: MemoryState, customerId: string) {
  for (const [id, s] of state.subscriptions) {
    if (s.subscription.customer === customerId) state.subscriptions.delete(id);
  }
  for (const [id, i] of state.invoices) {
    if (i.invoice.customer === customerId) state.invoices.delete(id);
  }
  for (const [id, m] of state.paymentMethods) {
    if (m.customerId === customerId) state.paymentMethods.delete(id);
  }
  for (const key of state.providerCustomers.keys()) {
    if (key.startsWith(`${customerId}:`)) state.providerCustomers.delete(key);
  }
}

/** Every store in memory, sharing one state — for tests and `bun run dev`. */
export function createMemoryStores(state: MemoryState = createMemoryState()): MemoryStores {
  const apiKeys = createMemoryApiKeyStore();
  return {
    state,
    apiKeys,
    merchants: createMemoryMerchantStore(state, apiKeys),
    idempotency: createMemoryIdempotencyStore(),
    checkoutSessions: createMemoryCheckoutSessionStore(state),
    payments: createMemoryPaymentStore(state),
    refunds: createMemoryRefundStore(state),
    providerAccounts: createMemoryProviderAccountStore(state),
    providerEvents: createMemoryProviderEventStore(state),
    webhookEndpoints: createMemoryWebhookEndpointStore(state),
    deliveries: createMemoryDeliveryStore(state),
    catalog: createMemoryCatalogStore(),
    customers: createMemoryCustomerStore(undefined, undefined, (id) =>
      removeCustomerRecords(state, id),
    ),
    billing: createMemoryBillingStore(state),
    events: createMemoryEventStore(state),
    paymentLinks: createMemoryPaymentLinkStore(),
    onboarding: createMemoryOnboardingStore(),
    ledger: createMemoryLedgerStore(state),
  };
}
