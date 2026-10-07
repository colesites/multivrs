import { z } from "zod";
import type { Db } from "../../db/client";
import { toUnix } from "../../db/convert";
import type { Event as EventRow } from "../../generated/prisma/client";
import { EVENT_TYPES } from "../../services/event.types";
import type { EventStore, ListedEvent } from "../event.store";

const EventDataSchema = z.object({ object: z.record(z.string(), z.unknown()) });
const EventTypeSchema = z.enum(EVENT_TYPES);

function eventFromRow(row: EventRow): ListedEvent {
  return {
    id: row.id,
    object: "event",
    type: EventTypeSchema.parse(row.type),
    livemode: row.mode === "live",
    created: toUnix(row.createdAt),
    data: EventDataSchema.parse(row.data),
  };
}

export function createPrismaEventStore(db: Db): EventStore {
  return {
    async list(merchantId, mode, limit) {
      const rows = await db.event.findMany({
        where: { merchantId, mode },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(eventFromRow);
    },
    async get(merchantId, mode, id) {
      const row = await db.event.findFirst({ where: { id, merchantId, mode } });
      return row ? eventFromRow(row) : null;
    },
  };
}
