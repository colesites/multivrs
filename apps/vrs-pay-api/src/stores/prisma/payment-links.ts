import type { Db } from "../../db/client";
import { toCurrency, toMinor, toUnix } from "../../db/convert";
import type { PaymentLink as LinkRow } from "../../generated/prisma/client";
import type { StoredPaymentLink } from "../../services/payment-link.types";
import type { PaymentLinkStore } from "../payment-link.store";

function linkFromRow(row: LinkRow): StoredPaymentLink {
  return {
    merchantId: row.merchantId,
    mode: row.mode,
    link: {
      id: row.id,
      object: "payment_link",
      livemode: row.mode === "live",
      price: row.priceId,
      interval: row.interval,
      amount: toMinor(row.amount),
      currency: toCurrency(row.currency).toLowerCase(),
      description: row.description,
      after_payment_url: row.afterPayment,
      active: row.active,
      created: toUnix(row.createdAt),
    },
  };
}

export function createPrismaPaymentLinkStore(db: Db): PaymentLinkStore {
  return {
    async create({ merchantId, mode, link }) {
      await db.paymentLink.create({
        data: {
          id: link.id,
          merchantId,
          mode,
          priceId: link.price,
          interval: link.interval,
          amount: BigInt(link.amount),
          currency: link.currency.toUpperCase(),
          description: link.description,
          afterPayment: link.after_payment_url,
          active: link.active,
          createdAt: new Date(link.created * 1000),
        },
      });
    },
    async list(merchantId, mode, limit) {
      const rows = await db.paymentLink.findMany({
        where: { merchantId, mode },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(linkFromRow);
    },
    async find(id) {
      const row = await db.paymentLink.findUnique({ where: { id } });
      return row ? linkFromRow(row) : null;
    },
    async setActive(merchantId, mode, id, active) {
      const { count } = await db.paymentLink.updateMany({
        where: { id, merchantId, mode },
        data: { active },
      });
      if (count === 0) return null;
      return linkFromRow(await db.paymentLink.findUniqueOrThrow({ where: { id } }));
    },
  };
}
