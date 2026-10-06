import type { ApiKeyMode } from "@vrs-pay/core";
import type { CheckoutSession, StoredCheckoutSession } from "../services/checkout-session.types";

/** Checkout sessions, always scoped to merchant + mode. */
export interface CheckoutSessionStore {
  save(record: StoredCheckoutSession): Promise<void>;
  get(merchantId: string, mode: ApiKeyMode, id: string): Promise<CheckoutSession | null>;
}

/** In-memory store for tests and local dev. */
export function createMemoryCheckoutSessionStore(): CheckoutSessionStore {
  const records = new Map<string, StoredCheckoutSession>();
  return {
    async save(record) {
      records.set(record.session.id, record);
    },
    async get(merchantId, mode, id) {
      const record = records.get(id);
      if (!record || record.merchantId !== merchantId || record.mode !== mode) return null;
      return record.session;
    },
  };
}
