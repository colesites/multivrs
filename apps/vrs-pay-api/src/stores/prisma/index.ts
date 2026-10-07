import type { Db } from "../../db/client";
import type { Stores } from "../stores.types";
import {
  createPrismaApiKeyStore,
  createPrismaProviderAccountStore,
  createPrismaProviderEventStore,
} from "./accounts";
import { createPrismaBillingStore } from "./billing";
import { createPrismaCatalogStore } from "./catalog";
import { createPrismaCheckoutSessionStore } from "./checkout-sessions";
import { createPrismaCustomerStore } from "./customers";
import { createPrismaEventStore } from "./events";
import { createPrismaIdempotencyStore } from "./idempotency";
import { createPrismaLedgerStore } from "./ledger";
import { createPrismaMerchantStore } from "./merchants";
import { createPrismaOnboardingStore } from "./onboarding";
import { createPrismaPaymentLinkStore } from "./payment-links";
import { createPrismaPaymentStore } from "./payments";
import { createPrismaRefundStore } from "./refunds";
import { createPrismaUsageStore } from "./usage";
import { createPrismaDeliveryStore, createPrismaWebhookEndpointStore } from "./webhooks";

/** Every store backed by the VRS Pay Postgres database. */
export function createPrismaStores(db: Db): Stores {
  return {
    apiKeys: createPrismaApiKeyStore(db),
    idempotency: createPrismaIdempotencyStore(db),
    checkoutSessions: createPrismaCheckoutSessionStore(db),
    payments: createPrismaPaymentStore(db),
    refunds: createPrismaRefundStore(db),
    providerAccounts: createPrismaProviderAccountStore(db),
    providerEvents: createPrismaProviderEventStore(db),
    webhookEndpoints: createPrismaWebhookEndpointStore(db),
    deliveries: createPrismaDeliveryStore(db),
    catalog: createPrismaCatalogStore(db),
    customers: createPrismaCustomerStore(db),
    billing: createPrismaBillingStore(db),
    events: createPrismaEventStore(db),
    merchants: createPrismaMerchantStore(db),
    paymentLinks: createPrismaPaymentLinkStore(db),
    onboarding: createPrismaOnboardingStore(db),
    ledger: createPrismaLedgerStore(db),
    usage: createPrismaUsageStore(db),
  };
}
