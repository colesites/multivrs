import type { Db } from "../../db/client";
import type { RefundStore } from "../refund.store";
import { type Tx, writeEffects } from "./effects";
import { refundFromRow } from "./mappers";

/**
 * Moves `delta` in or out of a payment's refunded total, only while it stays
 * within 0…amount. One conditional UPDATE, so concurrent refunds can't
 * over-refund. Returns the number of rows changed (0 or 1).
 */
function adjustRefunded(tx: Tx, paymentId: string, delta: bigint): Promise<number> {
  return tx.$executeRaw`
    UPDATE "payments"
    SET "amount_refunded" = "amount_refunded" + ${delta},
        "status" = (CASE
          WHEN "amount_refunded" + ${delta} <= 0 THEN 'succeeded'
          WHEN "amount_refunded" + ${delta} >= "amount" THEN 'refunded'
          ELSE 'partially_refunded' END)::"PaymentStatus",
        "updated_at" = now()
    WHERE "id" = ${paymentId}
      AND "amount_refunded" + ${delta} BETWEEN 0 AND "amount"`;
}

export function createPrismaRefundStore(db: Db): RefundStore {
  return {
    async reserve({ merchantId, mode, provider, refund }) {
      return db.$transaction(async (tx) => {
        if ((await adjustRefunded(tx, refund.payment, BigInt(refund.amount))) === 0) return false;
        await tx.refund.create({
          data: {
            id: refund.id,
            merchantId,
            mode,
            paymentId: refund.payment,
            provider,
            providerReference: refund.provider_reference,
            status: refund.status,
            amount: BigInt(refund.amount),
            currency: refund.currency.toUpperCase(),
            reason: refund.reason,
            metadata: refund.metadata,
            createdAt: new Date(refund.created * 1000),
          },
        });
        return true;
      });
    },
    async settle(id, update, effects) {
      return db.$transaction(async (tx) => {
        const current = await tx.refund.findUnique({ where: { id } });
        if (current?.status !== "pending") return null;
        const providerReference = update.providerReference ?? current.providerReference;
        const { count } = await tx.refund.updateMany({
          where: { id, status: "pending" },
          data: { status: update.status, providerReference },
        });
        if (count === 0) return null;
        if (update.status === "failed")
          await adjustRefunded(tx, current.paymentId, -current.amount);
        const updated = refundFromRow({ ...current, status: update.status, providerReference });
        if (update.status !== "pending") await writeEffects(tx, effects(updated));
        return updated;
      });
    },
    async get(merchantId, mode, id) {
      const row = await db.refund.findFirst({ where: { id, merchantId, mode } });
      return row ? refundFromRow(row) : null;
    },
    async list(merchantId, mode, limit) {
      const rows = await db.refund.findMany({
        where: { merchantId, mode },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(refundFromRow);
    },
    async find(lookup) {
      const row =
        "id" in lookup
          ? await db.refund.findUnique({ where: { id: lookup.id } })
          : await db.refund.findUnique({
              where: {
                provider_providerReference: {
                  provider: lookup.provider,
                  providerReference: lookup.reference,
                },
              },
            });
      return row ? refundFromRow(row) : null;
    },
  };
}
