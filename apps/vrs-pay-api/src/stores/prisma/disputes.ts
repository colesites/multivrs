import type { Db } from "../../db/client";
import { toCurrency, toMinor, toUnix } from "../../db/convert";
import type { Dispute as DisputeRow } from "../../generated/prisma/client";
import type { StoredDispute } from "../../services/dispute.types";
import type { DisputeStore } from "../dispute.store";
import { writeEffects } from "./effects";

function disputeFromRow(row: DisputeRow): StoredDispute {
  return {
    merchantId: row.merchantId,
    mode: row.mode,
    provider: row.provider,
    version: row.version,
    dispute: {
      id: row.id,
      object: "dispute",
      livemode: row.mode === "live",
      status: row.status,
      amount: toMinor(row.amount),
      currency: toCurrency(row.currency).toLowerCase(),
      amount_withdrawn: toMinor(row.amountWithdrawn),
      fee: toMinor(row.fee),
      reason: row.reason,
      evidence_due_by: row.evidenceDueBy ? toUnix(row.evidenceDueBy) : null,
      payment: row.paymentId,
      provider_reference: row.providerReference,
      created: toUnix(row.createdAt),
    },
  };
}

export function createPrismaDisputeStore(db: Db): DisputeStore {
  return {
    async save({ merchantId, mode, provider, version, dispute }, expectedVersion, effects) {
      const fields = {
        status: dispute.status,
        amount: BigInt(dispute.amount),
        amountWithdrawn: BigInt(dispute.amount_withdrawn),
        fee: BigInt(dispute.fee),
        reason: dispute.reason,
        evidenceDueBy: dispute.evidence_due_by ? new Date(dispute.evidence_due_by * 1000) : null,
        version,
      };
      return db.$transaction(async (tx) => {
        if (expectedVersion === null) {
          const { count } = await tx.dispute.createMany({
            data: {
              id: dispute.id,
              merchantId,
              mode,
              paymentId: dispute.payment,
              provider,
              providerReference: dispute.provider_reference,
              currency: dispute.currency.toUpperCase(),
              createdAt: new Date(dispute.created * 1000),
              ...fields,
            },
            skipDuplicates: true,
          });
          if (count === 0) return false;
        } else {
          const { count } = await tx.dispute.updateMany({
            where: { id: dispute.id, version: expectedVersion },
            data: fields,
          });
          if (count === 0) return false;
        }
        await writeEffects(tx, effects);
        return true;
      });
    },
    async get(merchantId, mode, id) {
      const row = await db.dispute.findFirst({ where: { id, merchantId, mode } });
      return row ? disputeFromRow(row) : null;
    },
    async find(provider, reference) {
      const row = await db.dispute.findUnique({
        where: { provider_providerReference: { provider, providerReference: reference } },
      });
      return row ? disputeFromRow(row) : null;
    },
    async list(merchantId, mode, limit) {
      const rows = await db.dispute.findMany({
        where: { merchantId, mode },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(disputeFromRow);
    },
  };
}
