import type { Db } from "../../db/client";
import type { UsageStore } from "../usage.store";

export function createPrismaUsageStore(db: Db): UsageStore {
  return {
    async add({ merchantId, mode, record }) {
      await db.usageRecord.create({
        data: {
          id: record.id,
          merchantId,
          mode,
          subscriptionId: record.subscription,
          quantity: BigInt(record.quantity),
          timestamp: new Date(record.timestamp * 1000),
        },
      });
    },
    async total({ subscriptionId, from, to, aggregate }) {
      const where = {
        subscriptionId,
        timestamp: { gte: new Date(from * 1000), lt: new Date(to * 1000) },
      };
      if (aggregate === "last") {
        const latest = await db.usageRecord.findFirst({
          where,
          orderBy: [{ timestamp: "desc" }, { createdAt: "desc" }],
          select: { quantity: true },
        });
        return Number(latest?.quantity ?? 0);
      }
      const result = await db.usageRecord.aggregate({
        where,
        _sum: { quantity: true },
        _max: { quantity: true },
      });
      return Number((aggregate === "sum" ? result._sum.quantity : result._max.quantity) ?? 0);
    },
  };
}
