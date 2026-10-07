import type { Db } from "../../db/client";
import { toMetadata, toUnix } from "../../db/convert";
import type { Customer as CustomerRow } from "../../generated/prisma/client";
import type { StoredCustomer } from "../../services/customer.types";
import type { CustomerStore } from "../customer.store";

function customerFromRow(row: CustomerRow): StoredCustomer {
  return {
    merchantId: row.merchantId,
    mode: row.mode,
    customer: {
      id: row.id,
      object: "customer",
      livemode: row.mode === "live",
      external_id: row.externalId,
      type: row.type,
      email: row.email,
      name: row.name,
      metadata: toMetadata(row.metadata),
      created: toUnix(row.createdAt),
    },
  };
}

export function createPrismaCustomerStore(db: Db): CustomerStore {
  return {
    async create({ merchantId, mode, customer }) {
      // ON CONFLICT DO NOTHING on (merchant, mode, external_id).
      const { count } = await db.customer.createMany({
        skipDuplicates: true,
        data: [
          {
            id: customer.id,
            merchantId,
            mode,
            externalId: customer.external_id,
            type: customer.type,
            email: customer.email,
            name: customer.name,
            metadata: customer.metadata,
            createdAt: new Date(customer.created * 1000),
          },
        ],
      });
      return count === 1;
    },
    async get(merchantId, mode, id) {
      const row = await db.customer.findFirst({ where: { id, merchantId, mode } });
      return row ? customerFromRow(row) : null;
    },
    async findByExternalId(merchantId, mode, externalId) {
      const row = await db.customer.findUnique({
        where: { merchantId_mode_externalId: { merchantId, mode, externalId } },
      });
      return row ? customerFromRow(row) : null;
    },
    async update(merchantId, mode, id, patch) {
      const { count } = await db.customer.updateMany({
        where: { id, merchantId, mode },
        data: patch,
      });
      if (count === 0) return null;
      return customerFromRow(await db.customer.findUniqueOrThrow({ where: { id } }));
    },
    async list(merchantId, mode, limit) {
      const rows = await db.customer.findMany({
        where: { merchantId, mode },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(customerFromRow);
    },
    async remove(merchantId, mode, id) {
      // Subscriptions, invoices, saved cards and provider customers cascade.
      const { count } = await db.customer.deleteMany({ where: { id, merchantId, mode } });
      return count > 0;
    },
    async createSession({ id, customerId, secretHash, expiresAt }) {
      await db.customerSession.create({ data: { id, customerId, secretHash, expiresAt } });
    },
    async findBySession(secretHash, now) {
      const session = await db.customerSession.findUnique({
        where: { secretHash },
        include: { customer: true },
      });
      if (!session || session.expiresAt <= now) return null;
      return customerFromRow(session.customer);
    },
  };
}
