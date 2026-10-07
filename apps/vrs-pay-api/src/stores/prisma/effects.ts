import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client";
import {
  type Effects,
  eventsOf,
  type LedgerPosting,
  postingsOf,
  type StoredEvent,
} from "../../services/event.types";
import { endpointAccepts } from "../../services/webhook-filter";

export type Tx = Prisma.TransactionClient;

const JsonObjectSchema = z.record(z.string(), z.json());

/** Our public objects as a Prisma JSON value (validated, so nothing odd slips in). */
export function toJsonObject(value: object): Prisma.InputJsonObject {
  return JsonObjectSchema.parse(value);
}

export function toJsonArray(value: readonly object[]): Prisma.InputJsonArray {
  return z.array(z.json()).parse(value);
}

/** Writes ledger postings (once per source) and events plus their deliveries. */
export async function writeEffects(tx: Tx, effects: Effects): Promise<void> {
  for (const posting of postingsOf(effects)) await writePosting(tx, posting);
  for (const event of eventsOf(effects)) await writeEvent(tx, event);
}

async function writePosting(tx: Tx, { mode, source, transaction }: LedgerPosting): Promise<void> {
  const posted = await tx.ledgerTransaction.findUnique({
    where: { sourceType_sourceId: { sourceType: source.type, sourceId: source.id } },
    select: { id: true },
  });
  if (posted) return;
  await tx.ledgerTransaction.create({
    data: {
      id: transaction.id,
      mode,
      sourceType: source.type,
      sourceId: source.id,
      description: transaction.description,
      createdAt: new Date(transaction.occurredAt),
      entries: {
        create: transaction.entries.map((entry) => ({
          mode,
          accountKind: entry.account.kind,
          accountOwner: entry.account.owner,
          direction: entry.direction,
          amount: BigInt(entry.amount.amount),
          currency: entry.amount.currency,
        })),
      },
    },
  });
}

async function writeEvent(tx: Tx, { merchantId, mode, event }: StoredEvent): Promise<void> {
  await tx.event.create({
    data: {
      id: event.id,
      merchantId,
      mode,
      type: event.type,
      data: toJsonObject(event.data),
      createdAt: new Date(event.created * 1000),
    },
  });
  const endpoints = await tx.webhookEndpoint.findMany({
    where: { merchantId, mode, disabledAt: null },
    select: { id: true, enabledEvents: true },
  });
  const targets = endpoints.filter((e) => endpointAccepts(e.enabledEvents, event.type));
  if (targets.length === 0) return;
  await tx.webhookDelivery.createMany({
    data: targets.map((e) => ({ eventId: event.id, endpointId: e.id })),
  });
}
