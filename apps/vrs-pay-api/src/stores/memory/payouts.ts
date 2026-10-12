import { canMove, type PayoutStore } from "../payout.store";
import { applyEffects, type MemoryState } from "./state";

export function createMemoryPayoutStore(state: MemoryState): PayoutStore {
  return {
    async create(record, effects) {
      const taken = [...state.payouts.values()].some(
        (p) =>
          p.merchantId === record.merchantId &&
          p.mode === record.mode &&
          p.day === record.day &&
          p.payout.currency === record.payout.currency,
      );
      if (taken) return false;
      state.payouts.set(record.payout.id, record);
      applyEffects(state, effects);
      return true;
    },
    async settle(id, update, effects) {
      const current = state.payouts.get(id);
      if (!current || !canMove(current.payout.status, update.status)) return null;
      const updated = {
        ...current,
        payout: {
          ...current.payout,
          status: update.status,
          failure_message: update.failureMessage,
        },
      };
      state.payouts.set(id, updated);
      applyEffects(state, effects(updated));
      return updated;
    },
    async get(merchantId, mode, id) {
      const record = state.payouts.get(id);
      if (!record || record.merchantId !== merchantId || record.mode !== mode) return null;
      return record;
    },
    async find(rail, reference) {
      return (
        [...state.payouts.values()].find(
          (p) => p.payout.rail === rail && p.payout.provider_reference === reference,
        ) ?? null
      );
    },
    async list(merchantId, mode, limit) {
      return [...state.payouts.values()]
        .filter((p) => p.merchantId === merchantId && p.mode === mode)
        .sort((a, b) => b.payout.created - a.payout.created)
        .slice(0, limit);
    },
    async pendingBefore(before) {
      return [...state.payouts.values()].filter(
        (p) => p.payout.status === "pending" && p.payout.created < before,
      );
    },
  };
}
