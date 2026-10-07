import type { BillingBatch, BillingStore, Scope } from "../billing.store";
import { applyEffects, type MemoryState, setSessionStatus } from "./state";

const inScope = (r: { merchantId: string; mode: string }, scope: Scope) =>
  r.merchantId === scope.merchantId && r.mode === scope.mode;

/** Checks every conflict before writing anything, like the Postgres transaction. */
function conflicts(state: MemoryState, batch: BillingBatch): boolean {
  for (const { record, expectedVersion } of batch.subscriptions ?? []) {
    const current = state.subscriptions.get(record.subscription.id);
    if (expectedVersion === null ? current : current?.version !== expectedVersion) return true;
  }
  for (const { record, create } of batch.invoices ?? []) {
    const { id, subscription, period_start, billing_reason } = record.invoice;
    const taken = [...state.invoices.values()].some(
      (i) =>
        i.invoice.id === id ||
        (subscription !== null &&
          i.invoice.subscription === subscription &&
          i.invoice.period_start === period_start &&
          i.invoice.billing_reason === billing_reason),
    );
    if (create && taken) return true;
  }
  return (batch.payments ?? []).some(({ payment }) =>
    [...state.payments.values()].some(
      (p) =>
        p.payment.provider === payment.provider &&
        p.payment.provider_reference === payment.provider_reference,
    ),
  );
}

export function createMemoryBillingStore(state: MemoryState): BillingStore {
  return {
    async getSubscription(scope, id) {
      const r = state.subscriptions.get(id);
      return r && inScope(r, scope) ? r : null;
    },
    async findSubscription(id) {
      return state.subscriptions.get(id) ?? null;
    },
    async listSubscriptions(scope, customerId) {
      return [...state.subscriptions.values()].filter(
        (r) => inScope(r, scope) && (!customerId || r.subscription.customer === customerId),
      );
    },
    async getInvoice(scope, id) {
      const r = state.invoices.get(id);
      return r && inScope(r, scope) ? r : null;
    },
    async listInvoices(scope, { customerId, subscriptionId }) {
      return [...state.invoices.values()].filter(
        ({ invoice, ...r }) =>
          inScope(r, scope) &&
          (!customerId || invoice.customer === customerId) &&
          (!subscriptionId || invoice.subscription === subscriptionId),
      );
    },
    async getPaymentMethod(id) {
      return state.paymentMethods.get(id) ?? null;
    },
    async findPaymentMethodByRef(provider, providerRef) {
      return (
        [...state.paymentMethods.values()].find(
          (m) => m.provider === provider && m.providerRef === providerRef,
        ) ?? null
      );
    },
    async getProviderCustomer(customerId, provider) {
      return state.providerCustomers.get(`${customerId}:${provider}`) ?? null;
    },
    async dueSubscriptions(now, limit) {
      const at = now.getTime() / 1000;
      return [...state.subscriptions.values()]
        .filter(
          ({ subscription: s }) =>
            (s.status === "trialing" || s.status === "active") &&
            s.current_period_end !== null &&
            s.current_period_end <= at,
        )
        .slice(0, limit);
    },
    async dueInvoices(now, limit) {
      const at = now.getTime() / 1000;
      return [...state.invoices.values()]
        .filter(
          ({ invoice: i }) =>
            i.status === "open" && i.next_attempt_at !== null && i.next_attempt_at <= at,
        )
        .slice(0, limit);
    },
    async commit(batch) {
      if (conflicts(state, batch)) return false;
      for (const { record } of batch.subscriptions ?? [])
        state.subscriptions.set(record.subscription.id, record);
      for (const { record } of batch.invoices ?? []) state.invoices.set(record.invoice.id, record);
      for (const payment of batch.payments ?? []) state.payments.set(payment.payment.id, payment);
      for (const method of batch.paymentMethods ?? []) {
        const existing = [...state.paymentMethods.values()].find(
          (m) => m.provider === method.provider && m.providerRef === method.providerRef,
        );
        state.paymentMethods.set(existing?.id ?? method.id, {
          ...method,
          id: existing?.id ?? method.id,
        });
      }
      for (const p of batch.providerCustomers ?? []) {
        const key = `${p.customerId}:${p.provider}`;
        if (!state.providerCustomers.has(key)) state.providerCustomers.set(key, p.reference);
      }
      if (batch.completeSession) setSessionStatus(state, batch.completeSession, "complete");
      if (batch.effects) applyEffects(state, batch.effects);
      return true;
    },
  };
}
