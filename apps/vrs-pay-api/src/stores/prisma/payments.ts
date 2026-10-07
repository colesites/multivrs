import type { Db } from "../../db/client";
import type { PaymentStore } from "../payment.store";
import { writeEffects } from "./effects";
import { paymentFromRow } from "./mappers";
import { paymentRow } from "./payment-row";

export function createPrismaPaymentStore(db: Db): PaymentStore {
  return {
    async recordCapture(record, effects) {
      const { payment } = record;
      return db.$transaction(async (tx) => {
        // ON CONFLICT DO NOTHING: a redelivered webhook inserts nothing.
        const { count } = await tx.payment.createMany({
          skipDuplicates: true,
          data: [paymentRow(record)],
        });
        if (count === 0) return false;
        if (payment.checkout_session) {
          await tx.checkoutSession.update({
            where: { id: payment.checkout_session },
            data: { status: "complete" },
          });
        }
        await writeEffects(tx, effects);
        return true;
      });
    },
    async get(merchantId, mode, id) {
      const row = await db.payment.findFirst({ where: { id, merchantId, mode } });
      return row ? paymentFromRow(row) : null;
    },
    async list(merchantId, mode, limit) {
      const rows = await db.payment.findMany({
        where: { merchantId, mode },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(paymentFromRow);
    },
    async findByReference(provider, reference) {
      const row = await db.payment.findUnique({
        where: { provider_providerReference: { provider, providerReference: reference } },
      });
      return row ? paymentFromRow(row) : null;
    },
  };
}
