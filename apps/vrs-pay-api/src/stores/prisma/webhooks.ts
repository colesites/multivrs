import type { Db } from "../../db/client";
import { deliveryView } from "../../services/webhook-delivery-view";
import type { DeliveryStore, WebhookEndpointStore } from "../webhook.store";
import { endpointFromRow } from "./mappers";

/** How long a claimed delivery stays leased before another worker may retry it. */
const LEASE_MS = 5 * 60 * 1000;

interface ClaimedRow {
  id: string;
  attempts: number;
  event_id: string;
  endpoint_id: string;
}

export function createPrismaWebhookEndpointStore(db: Db): WebhookEndpointStore {
  return {
    async create({ merchantId, mode, secret, endpoint }) {
      await db.webhookEndpoint.create({
        data: {
          id: endpoint.id,
          merchantId,
          mode,
          url: endpoint.url,
          secret,
          enabledEvents: endpoint.enabled_events,
          createdAt: new Date(endpoint.created * 1000),
        },
      });
    },
    async list(merchantId, mode) {
      const rows = await db.webhookEndpoint.findMany({
        where: { merchantId, mode },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(endpointFromRow);
    },
    async get(merchantId, mode, id) {
      const row = await db.webhookEndpoint.findFirst({ where: { id, merchantId, mode } });
      return row ? { merchantId, mode, secret: row.secret, endpoint: endpointFromRow(row) } : null;
    },
    async update(merchantId, mode, id, patch) {
      const { count } = await db.webhookEndpoint.updateMany({
        where: { id, merchantId, mode, disabledAt: null },
        data: {
          ...(patch.url ? { url: patch.url } : {}),
          ...(patch.enabledEvents ? { enabledEvents: patch.enabledEvents } : {}),
        },
      });
      if (count !== 1) return null;
      return endpointFromRow(await db.webhookEndpoint.findUniqueOrThrow({ where: { id } }));
    },
    async disable(merchantId, mode, id) {
      const { count } = await db.webhookEndpoint.updateMany({
        where: { id, merchantId, mode, disabledAt: null },
        data: { disabledAt: new Date() },
      });
      return count === 1;
    },
  };
}

export function createPrismaDeliveryStore(db: Db): DeliveryStore {
  return {
    async claimDue(limit, now) {
      const leaseUntil = new Date(now.getTime() + LEASE_MS);
      // SKIP LOCKED: concurrent workers each get different rows.
      const claimed = await db.$queryRaw<ClaimedRow[]>`
        WITH due AS (
          SELECT "id" FROM "webhook_deliveries"
          WHERE "status" = 'pending' AND "next_attempt_at" <= ${now}::timestamp(3)
          ORDER BY "next_attempt_at"
          LIMIT ${limit}
          FOR UPDATE SKIP LOCKED
        )
        UPDATE "webhook_deliveries" AS d
        SET "next_attempt_at" = ${leaseUntil}::timestamp(3)
        FROM due WHERE d."id" = due."id"
        RETURNING d."id"::text AS id, d."attempts", d."event_id", d."endpoint_id"`;
      if (claimed.length === 0) return [];
      const [events, endpoints] = await Promise.all([
        db.event.findMany({ where: { id: { in: claimed.map((c) => c.event_id) } } }),
        db.webhookEndpoint.findMany({ where: { id: { in: claimed.map((c) => c.endpoint_id) } } }),
      ]);
      return claimed.flatMap((c) => {
        const event = events.find((e) => e.id === c.event_id);
        const endpoint = endpoints.find((e) => e.id === c.endpoint_id);
        if (!event || !endpoint) return [];
        const payload = JSON.stringify({
          id: event.id,
          object: "event",
          type: event.type,
          livemode: event.mode === "live",
          created: Math.floor(event.createdAt.getTime() / 1000),
          data: event.data,
        });
        return [
          { id: c.id, attempts: c.attempts, url: endpoint.url, secret: endpoint.secret, payload },
        ];
      });
    },
    async markSucceeded(id, statusCode, now) {
      await db.webhookDelivery.update({
        where: { id },
        data: {
          status: "succeeded",
          attempts: { increment: 1 },
          lastStatusCode: statusCode,
          lastError: null,
          deliveredAt: now,
        },
      });
    },
    async markFailed(id, failure) {
      await db.webhookDelivery.update({
        where: { id },
        data: {
          status: failure.nextAttemptAt ? "pending" : "failed",
          attempts: failure.attempts,
          ...(failure.nextAttemptAt ? { nextAttemptAt: failure.nextAttemptAt } : {}),
          lastStatusCode: failure.statusCode,
          lastError: failure.error.slice(0, 500),
        },
      });
    },
    async listForEndpoint(endpointId, limit) {
      const rows = await db.webhookDelivery.findMany({
        where: { endpointId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { event: { select: { type: true } } },
      });
      return rows.map((row) => deliveryView({ ...row, eventType: row.event.type }));
    },
    async retryNow(endpointId, deliveryId, now) {
      const { count } = await db.webhookDelivery.updateMany({
        where: { id: deliveryId, endpointId },
        data: { status: "pending", nextAttemptAt: now },
      });
      return count === 1;
    },
  };
}
