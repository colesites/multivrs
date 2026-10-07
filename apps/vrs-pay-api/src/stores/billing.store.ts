import type { ApiKeyMode, ProviderId } from "@vrs-pay/core";
import type { Effects } from "../services/event.types";
import type { StoredPayment } from "../services/payment.types";
import type {
  PaymentMethodRecord,
  StoredInvoice,
  StoredSubscription,
} from "../services/subscription.types";

export interface Scope {
  merchantId: string;
  mode: ApiKeyMode;
}

/**
 * Everything one billing step writes, applied atomically. Any conflict —
 * a subscription changed since it was read (version), an invoice for that
 * period already exists, a provider payment already recorded — writes
 * nothing and makes `commit` return false.
 */
export interface BillingBatch {
  /** `expectedVersion` null creates; otherwise updates only that version. */
  subscriptions?: Array<{ record: StoredSubscription; expectedVersion: number | null }>;
  invoices?: Array<{ record: StoredInvoice; create: boolean }>;
  payments?: StoredPayment[];
  /** Upserted by provider + provider reference. */
  paymentMethods?: PaymentMethodRecord[];
  providerCustomers?: Array<{ customerId: string; provider: ProviderId; reference: string }>;
  completeSession?: string;
  effects?: Effects;
}

export interface BillingStore {
  getSubscription(scope: Scope, id: string): Promise<StoredSubscription | null>;
  /** Unscoped, for webhooks and the engine. */
  findSubscription(id: string): Promise<StoredSubscription | null>;
  listSubscriptions(scope: Scope, customerId?: string): Promise<StoredSubscription[]>;
  getInvoice(scope: Scope, id: string): Promise<StoredInvoice | null>;
  listInvoices(
    scope: Scope,
    filter: { customerId?: string; subscriptionId?: string },
  ): Promise<StoredInvoice[]>;
  getPaymentMethod(id: string): Promise<PaymentMethodRecord | null>;
  findPaymentMethodByRef(
    provider: ProviderId,
    providerRef: string,
  ): Promise<PaymentMethodRecord | null>;
  getProviderCustomer(customerId: string, provider: ProviderId): Promise<string | null>;
  /** Trialing/active subscriptions whose period (or trial) has ended. */
  dueSubscriptions(now: Date, limit: number): Promise<StoredSubscription[]>;
  /** Open invoices whose next attempt is due. */
  dueInvoices(now: Date, limit: number): Promise<StoredInvoice[]>;
  commit(batch: BillingBatch): Promise<boolean>;
}
