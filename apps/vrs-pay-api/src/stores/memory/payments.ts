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
    async list(merchantId, mode, limitOrFilters) {
      const filters =
        typeof limitOrFilters === "number" ? { limit: limitOrFilters } : limitOrFilters;
      const limit = filters.limit ?? 100;
      const search = filters.search?.toLowerCase().trim();
      return [...state.payments.values()]
        .filter((r) => {
          if (r.merchantId !== merchantId || r.mode !== mode) return false;
          if (filters.status && filters.status !== "all" && r.payment.status !== filters.status)
            return false;
          // A payment's customer and description live on its checkout session.
          const session = r.payment.checkout_session
            ? state.sessions.get(r.payment.checkout_session)?.session
            : undefined;
          if (filters.customer && session?.customer !== filters.customer) return false;
          if (search) {
            const matchesId = r.payment.id.toLowerCase().includes(search);
            const matchesEmail = r.payment.customer_email?.toLowerCase().includes(search);
            const matchesDesc = session?.description?.toLowerCase().includes(search);
            const matchesRef = r.payment.provider_reference?.toLowerCase().includes(search);
            if (!matchesId && !matchesEmail && !matchesDesc && !matchesRef) return false;
          }
          return true;
        })
        .sort((a, b) => b.payment.created - a.payment.created)
        .slice(0, limit);
    },
  };
}
