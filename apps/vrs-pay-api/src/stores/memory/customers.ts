import type { StoredCustomer, StoredCustomerSession } from "../../services/customer.types";
import type { CustomerStore } from "../customer.store";

export function createMemoryCustomerStore(
  customers = new Map<string, StoredCustomer>(),
  sessions = new Map<string, StoredCustomerSession>(),
): CustomerStore {
  const owned = (r: StoredCustomer | undefined, merchantId: string, mode: string) =>
    r && r.merchantId === merchantId && r.mode === mode ? r : null;
  const byExternalId = (merchantId: string, mode: string, externalId: string) =>
    [...customers.values()].find(
      (r) => owned(r, merchantId, mode) && r.customer.external_id === externalId,
    ) ?? null;
  return {
    async create(record) {
      if (byExternalId(record.merchantId, record.mode, record.customer.external_id)) return false;
      customers.set(record.customer.id, record);
      return true;
    },
    async get(merchantId, mode, id) {
      return owned(customers.get(id), merchantId, mode);
    },
    async findByExternalId(merchantId, mode, externalId) {
      return byExternalId(merchantId, mode, externalId);
    },
    async update(merchantId, mode, id, patch) {
      const record = owned(customers.get(id), merchantId, mode);
      if (!record) return null;
      const updated = { ...record, customer: { ...record.customer, ...patch } };
      customers.set(id, updated);
      return updated;
    },
    async list(merchantId, mode, limit) {
      return [...customers.values()]
        .filter((r) => owned(r, merchantId, mode))
        .sort((a, b) => b.customer.created - a.customer.created)
        .slice(0, limit);
    },
    async createSession(session) {
      sessions.set(session.secretHash, session);
    },
    async findBySession(secretHash, now) {
      const session = sessions.get(secretHash);
      if (!session || session.expiresAt <= now) return null;
      return customers.get(session.customerId) ?? null;
    },
  };
}
