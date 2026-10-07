import type { PaymentStore } from "../payment.store";
import { applyEffects, type MemoryState, setSessionStatus } from "./state";

export function createMemoryPaymentStore(state: MemoryState): PaymentStore {
  const findByReference: PaymentStore["findByReference"] = async (provider, reference) => {
    for (const record of state.payments.values()) {
      const { payment } = record;
      if (payment.provider === provider && payment.provider_reference === reference) return record;
    }
    return null;
  };
  return {
    async recordCapture(record, effects) {
      const { payment } = record;
      if (await findByReference(payment.provider, payment.provider_reference)) return false;
      state.payments.set(payment.id, record);
      if (payment.checkout_session) setSessionStatus(state, payment.checkout_session, "complete");
      applyEffects(state, effects);
      return true;
    },
    async get(merchantId, mode, id) {
      const record = state.payments.get(id);
      if (!record || record.merchantId !== merchantId || record.mode !== mode) return null;
      return record;
    },
    findByReference,
    async list(merchantId, mode, limit) {
      return [...state.payments.values()]
        .filter((r) => r.merchantId === merchantId && r.mode === mode)
        .sort((a, b) => b.payment.created - a.payment.created)
        .slice(0, limit);
    },
  };
}
