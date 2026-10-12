import type { Db } from "../../db/client";
import { toCurrency, toMinor, toUnix } from "../../db/convert";
import type { Payout as PayoutRow } from "../../generated/prisma/client";
import type { StoredPayout } from "../../services/payout.types";
import type { PayoutStore } from "../payout.store";
import { writeEffects } from "./effects";

function payoutFromRow(row: PayoutRow): StoredPayout {
  return {
    merchantId: row.merchantId,
    mode: row.mode,
    day: row.payoutDay,
    payout: {
      id: row.id,
      object: "payout",
      livemode: row.mode === "live",
      status: row.status,
      amount: toMinor(row.amount),
      fee: toMinor(row.fee),
      currency: toCurrency(row.currency).toLowerCase(),
      rail: row.rail,
      destination: { bank_name: row.bankName, last4: row.last4 },
      provider_reference: row.providerReference,
      failure_message: row.failureMessage,
      created: toUnix(row.createdAt),
    },
  };
}

export function createPrismaPayoutStore(db: Db): PayoutStore {
  return {
    async create({ merchantId, mode, day, payout }, effects) {
      return db.$transaction(async (tx) => {
        const { count } = await tx.payout.createMany({
          data: {
            id: payout.id,
            merchantId,
            mode,
            payoutDay: day,
            rail: payout.rail,
            providerReference: payout.provider_reference,
            status: payout.status,
            amount: BigInt(payout.amount),
            fee: BigInt(payout.fee),
            currency: payout.currency.toUpperCase(),
            bankName: payout.destination.bank_name,
            last4: payout.destination.last4,
            createdAt: new Date(payout.created * 1000),
          },
          skipDuplicates: true,
        });
        if (count === 0) return false;
        await writeEffects(tx, effects);
        return true;
      });
    },
    async settle(id, update, effects) {
      return db.$transaction(async (tx) => {
        const { count } = await tx.payout.updateMany({
          where: {
            id,
            status: { in: update.status === "failed" ? ["pending", "paid"] : ["pending"] },
          },
          data: { status: update.status, failureMessage: update.failureMessage },
        });
        if (count === 0) return null;
        const row = await tx.payout.findUniqueOrThrow({ where: { id } });
        const updated = payoutFromRow(row);
        await writeEffects(tx, effects(updated));
        return updated;
      });
    },
    async get(merchantId, mode, id) {
      const row = await db.payout.findFirst({ where: { id, merchantId, mode } });
      return row ? payoutFromRow(row) : null;
    },
    async find(rail, reference) {
      const row = await db.payout.findUnique({
        where: { rail_providerReference: { rail, providerReference: reference } },
      });
      return row ? payoutFromRow(row) : null;
    },
    async list(merchantId, mode, limit) {
      const rows = await db.payout.findMany({
        where: { merchantId, mode },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(payoutFromRow);
    },
    async pendingBefore(before) {
      const rows = await db.payout.findMany({
        where: { status: "pending", createdAt: { lt: new Date(before * 1000) } },
        take: 100,
      });
      return rows.map(payoutFromRow);
    },
  };
}
