import type { DisputeStore } from "../dispute.store";
import { applyEffects, type MemoryState } from "./state";

export function createMemoryDisputeStore(state: MemoryState): DisputeStore {
  const byReference = (provider: string, reference: string) =>
    [...state.disputes.values()].find(
      (d) => d.provider === provider && d.dispute.provider_reference === reference,
    ) ?? null;
  return {
    async save(record, expectedVersion, effects) {
      const current = byReference(record.provider, record.dispute.provider_reference);
      if ((current?.version ?? null) !== expectedVersion) return false;
      state.disputes.set(record.dispute.id, record);
      applyEffects(state, effects);
      return true;
    },
    async get(merchantId, mode, id) {
      const record = state.disputes.get(id);
      if (!record || record.merchantId !== merchantId || record.mode !== mode) return null;
      return record;
    },
    async find(provider, reference) {
      return byReference(provider, reference);
    },
    async list(merchantId, mode, limit) {
      return [...state.disputes.values()]
        .filter((d) => d.merchantId === merchantId && d.mode === mode)
        .sort((a, b) => b.dispute.created - a.dispute.created)
        .slice(0, limit);
    },
  };
}
