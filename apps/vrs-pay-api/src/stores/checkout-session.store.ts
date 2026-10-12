import type { ApiKeyMode, ProviderId } from "@vrs-pay/core";
import type { CheckoutSession, StoredCheckoutSession } from "../services/checkout-session.types";
import type { Effects } from "../services/event.types";

/** Checkout sessions. API reads are always scoped to merchant + mode. */
export interface CheckoutSessionStore {
  save(record: StoredCheckoutSession): Promise<void>;
  get(merchantId: string, mode: ApiKeyMode, id: string): Promise<CheckoutSession | null>;
  /** Public lookup for custom checkout UI / payment links by session id. */
  findById(id: string): Promise<StoredCheckoutSession | null>;
  /** Webhook lookup by the provider's checkout id. */
  findByReference(provider: ProviderId, reference: string): Promise<StoredCheckoutSession | null>;
  /**
   * Stores where an open session's buyer now pays (a provider page started
   * once their email was known). Returns false if it isn't open any more.
   */
  setHostedCheckout(id: string, url: string, customerEmail: string): Promise<boolean>;
  /** Marks an open session expired; returns it, or null if it wasn't open. */
  expire(
    id: string,
    effects: (session: StoredCheckoutSession) => Effects,
  ): Promise<StoredCheckoutSession | null>;
  /** Metrics for conversion rate calculation. */
  metrics(
    merchantId: string,
    mode: ApiKeyMode,
    since?: number,
  ): Promise<{ total: number; completed: number }>;
}
