import type { StoredPayment } from "../../services/payment.types";
import { paymentStatusFor } from "../../services/payment-status";
import type { RefundStore } from "../refund.store";
import { applyEffects, type MemoryState } from "./state";

function adjustRefunded(
  state: MemoryState,
  paymentId: string,
  delta: number,
): StoredPayment | null {
  const record = state.payments.get(paymentId);
  if (!record) return null;
  const amountRefunded = record.payment.amount_refunded + delta;
  if (amountRefunded < 0 || amountRefunded > record.payment.amount) return null;
  const payment = {
    ...record.payment,
    amount_refunded: amountRefunded,
    status: paymentStatusFor(record.payment.amount, amountRefunded),
  };
  const updated = { ...record, payment };
  state.payments.set(paymentId, updated);
  return updated;
}

export function createMemoryRefundStore(state: MemoryState): RefundStore {
  return {
    async reserve(record) {
      if (!adjustRefunded(state, record.refund.payment, record.refund.amount)) return false;
      state.refunds.set(record.refund.id, record);
      return true;
    },
    async settle(id, update, effects) {
      const current = state.refunds.get(id);
      if (current?.refund.status !== "pending") return null;
      const refund = {
        ...current.refund,
        status: update.status,
        provider_reference: update.providerReference ?? current.refund.provider_reference,
      };
      const updated = { ...current, refund };
      state.refunds.set(id, updated);
      if (update.status === "failed") adjustRefunded(state, refund.payment, -refund.amount);
      if (update.status !== "pending") applyEffects(state, effects(updated));
      return updated;
    },
    async get(merchantId, mode, id) {
      const record = state.refunds.get(id);
      if (!record || record.merchantId !== merchantId || record.mode !== mode) return null;
      return record;
    },
    async list(merchantId, mode, limit) {
      return [...state.refunds.values()]
        .filter((r) => r.merchantId === merchantId && r.mode === mode)
        .sort((a, b) => b.refund.created - a.refund.created)
        .slice(0, limit);
    },
    async find(lookup) {
      if ("id" in lookup) return state.refunds.get(lookup.id) ?? null;
      for (const record of state.refunds.values()) {
        if (
          record.provider === lookup.provider &&
          record.refund.provider_reference === lookup.reference
        ) {
          return record;
        }
      }
      return null;
    },
  };
}
