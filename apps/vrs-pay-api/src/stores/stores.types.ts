import type { IdempotencyStore } from "@vrs-pay/core";
import type { ApiKeyStore } from "./api-key.store";
import type { BillingStore } from "./billing.store";
import type { CatalogStore } from "./catalog.store";
import type { CheckoutSessionStore } from "./checkout-session.store";
import type { CustomerStore } from "./customer.store";
import type { EventStore } from "./event.store";
import type { LedgerStore } from "./ledger.store";
import type { MerchantStore } from "./merchant.store";
import type { OnboardingStore } from "./onboarding.store";
import type { PaymentStore } from "./payment.store";
import type { PaymentLinkStore } from "./payment-link.store";
import type { ProviderAccountStore, ProviderEventStore } from "./provider-account.store";
import type { RefundStore } from "./refund.store";
import type { UsageStore } from "./usage.store";
import type { DeliveryStore, WebhookEndpointStore } from "./webhook.store";

/** Every store the app uses; memory and Postgres implementations both satisfy it. */
export interface Stores {
  apiKeys: ApiKeyStore;
  idempotency: IdempotencyStore;
  checkoutSessions: CheckoutSessionStore;
  payments: PaymentStore;
  refunds: RefundStore;
  providerAccounts: ProviderAccountStore;
  providerEvents: ProviderEventStore;
  webhookEndpoints: WebhookEndpointStore;
  deliveries: DeliveryStore;
  catalog: CatalogStore;
  customers: CustomerStore;
  billing: BillingStore;
  events: EventStore;
  merchants: MerchantStore;
  paymentLinks: PaymentLinkStore;
  onboarding: OnboardingStore;
  ledger: LedgerStore;
  usage: UsageStore;
}
