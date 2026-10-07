import type { StoredPaymentLink } from "../../services/payment-link.types";
import type { PaymentLinkStore } from "../payment-link.store";

export function createMemoryPaymentLinkStore(
  links = new Map<string, StoredPaymentLink>(),
): PaymentLinkStore {
  return {
    async create(record) {
      links.set(record.link.id, record);
    },
    async list(merchantId, mode, limit) {
      return [...links.values()]
        .filter((r) => r.merchantId === merchantId && r.mode === mode)
        .sort((a, b) => b.link.created - a.link.created)
        .slice(0, limit);
    },
    async find(id) {
      return links.get(id) ?? null;
    },
    async setActive(merchantId, mode, id, active) {
      const record = links.get(id);
      if (!record || record.merchantId !== merchantId || record.mode !== mode) return null;
      const updated = { ...record, link: { ...record.link, active } };
      links.set(id, updated);
      return updated;
    },
  };
}
