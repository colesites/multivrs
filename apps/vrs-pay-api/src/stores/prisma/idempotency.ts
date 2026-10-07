import { IDEMPOTENCY_TTL_MS, type IdempotencyStore } from "@vrs-pay/core";
import type { Db } from "../../db/client";

/**
 * Postgres-backed idempotency keys. `claim` is a single INSERT … ON CONFLICT
 * DO NOTHING, so two requests racing on one key can't both proceed.
 */
export function createPrismaIdempotencyStore(
  db: Db,
  ttlMs: number = IDEMPOTENCY_TTL_MS,
): IdempotencyStore {
  return {
    async claim(scope, key, requestHash) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttlMs);
      // An expired key may be reused: clear it before claiming.
      await db.idempotencyKey.deleteMany({ where: { scope, key, expiresAt: { lte: now } } });
      const { count } = await db.idempotencyKey.createMany({
        data: [{ scope, key, requestHash, expiresAt }],
        skipDuplicates: true,
      });
      if (count === 1) return null;
      const row = await db.idempotencyKey.findUnique({ where: { scope_key: { scope, key } } });
      // Released between our insert and read: let the caller retry the claim.
      if (!row) return { state: "in_progress", requestHash, createdAt: now.getTime() };
      const createdAt = row.createdAt.getTime();
      if (row.status === "completed" && row.responseStatus !== null && row.responseBody !== null) {
        return {
          state: "completed",
          requestHash: row.requestHash,
          createdAt,
          status: row.responseStatus,
          body: row.responseBody,
        };
      }
      return { state: "in_progress", requestHash: row.requestHash, createdAt };
    },
    async complete(scope, key, result) {
      await db.idempotencyKey.updateMany({
        where: { scope, key },
        data: { status: "completed", responseStatus: result.status, responseBody: result.body },
      });
    },
    async release(scope, key) {
      await db.idempotencyKey.deleteMany({ where: { scope, key } });
    },
  };
}
