import type { Db } from "../../db/client";
import type { BillingStore } from "../billing.store";
import { Conflict, isUniqueViolation, writeBatch } from "./billing-batch";
import { invoiceFromRow, methodFromRow, subscriptionFromRow } from "./billing-mappers";

export function createPrismaBillingStore(db: Db): BillingStore {
  return {
    async getSubscription({ merchantId, mode }, id) {
      const row = await db.subscription.findFirst({ where: { id, merchantId, mode } });
      return row ? subscriptionFromRow(row) : null;
    },
    async findSubscription(id) {
      const row = await db.subscription.findUnique({ where: { id } });
      return row ? subscriptionFromRow(row) : null;
    },
    async listSubscriptions({ merchantId, mode }, customerId) {
      const rows = await db.subscription.findMany({
        where: { merchantId, mode, ...(customerId ? { customerId } : {}) },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(subscriptionFromRow);
    },
    async getInvoice({ merchantId, mode }, id) {
      const row = await db.invoice.findFirst({ where: { id, merchantId, mode } });
      return row ? invoiceFromRow(row) : null;
    },
    async listInvoices({ merchantId, mode }, { customerId, subscriptionId }) {
      const rows = await db.invoice.findMany({
        where: {
          merchantId,
          mode,
          ...(customerId ? { customerId } : {}),
          ...(subscriptionId ? { subscriptionId } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(invoiceFromRow);
    },
    async getPaymentMethod(id) {
      const row = await db.paymentMethod.findUnique({ where: { id } });
      return row ? methodFromRow(row) : null;
    },
    async findPaymentMethodByRef(provider, providerRef) {
      const row = await db.paymentMethod.findUnique({
        where: { provider_providerRef: { provider, providerRef } },
      });
      return row ? methodFromRow(row) : null;
    },
    async getProviderCustomer(customerId, provider) {
      const row = await db.providerCustomer.findUnique({
        where: { customerId_provider: { customerId, provider } },
      });
      return row?.externalRef ?? null;
    },
    async dueSubscriptions(now, limit) {
      const rows = await db.subscription.findMany({
        where: { status: { in: ["trialing", "active"] }, currentPeriodEnd: { lte: now } },
        orderBy: { currentPeriodEnd: "asc" },
        take: limit,
      });
      return rows.map(subscriptionFromRow);
    },
    async dueInvoices(now, limit) {
      const rows = await db.invoice.findMany({
        where: { status: "open", nextAttemptAt: { lte: now } },
        orderBy: { nextAttemptAt: "asc" },
        take: limit,
      });
      return rows.map(invoiceFromRow);
    },
    async commit(batch) {
      try {
        await db.$transaction((tx) => writeBatch(tx, batch));
        return true;
      } catch (error) {
        if (error instanceof Conflict || isUniqueViolation(error)) return false;
        throw error;
      }
    },
  };
}
