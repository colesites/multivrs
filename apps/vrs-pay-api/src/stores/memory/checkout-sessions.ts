import type { CheckoutSessionStore } from "../checkout-session.store";
import { applyEffects, type MemoryState, setSessionStatus } from "./state";

export function createMemoryCheckoutSessionStore(state: MemoryState): CheckoutSessionStore {
  return {
    async save(record) {
      state.sessions.set(record.session.id, record);
    },
    async get(merchantId, mode, id) {
      const record = state.sessions.get(id);
      if (!record || record.merchantId !== merchantId || record.mode !== mode) return null;
      return record.session;
    },
    async findByReference(provider, reference) {
      for (const record of state.sessions.values()) {
        const { session } = record;
        if (session.provider === provider && session.provider_reference === reference) {
          return record;
        }
      }
      return null;
    },
    async expire(id, effects) {
      if (state.sessions.get(id)?.session.status !== "open") return null;
      const updated = setSessionStatus(state, id, "expired");
      if (updated) applyEffects(state, effects(updated));
      return updated;
    },
  };
}
