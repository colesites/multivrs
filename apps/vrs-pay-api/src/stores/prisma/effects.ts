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

/** Writes ledger postings (once per source) and events plus their deliveries, in a few batched queries. */
export async function writeEffects(tx: Tx, effects: Effects): Promise<void> {
  await writePostings(tx, postingsOf(effects));
  await writeEvents(tx, eventsOf(effects));
}

const sourceKey = ({ source }: LedgerPosting) => `${source.type}:${source.id}`;

/** Postings whose source isn't posted yet: one lookup, then one insert each for transactions and entries. */
async function writePostings(tx: Tx, postings: readonly LedgerPosting[]): Promise<void> {
  if (postings.length === 0) return;
  const posted = await tx.ledgerTransaction.findMany({
    where: { OR: postings.map(({ source }) => ({ sourceType: source.type, sourceId: source.id })) },
    select: { sourceType: true, sourceId: true },
  });
  const seen = new Set(posted.map((p) => `${p.sourceType}:${p.sourceId}`));
  const fresh = postings.filter((p) => {
    if (seen.has(sourceKey(p))) return false;
    seen.add(sourceKey(p));
    return true;
  });
  if (fresh.length === 0) return;
  await tx.ledgerTransaction.createMany({
    data: fresh.map(({ mode, source, transaction }) => ({
      id: transaction.id,
      mode,
      sourceType: source.type,
      sourceId: source.id,
      description: transaction.description,
      createdAt: new Date(transaction.occurredAt),
    })),
  });
  await tx.ledgerEntry.createMany({
    data: fresh.flatMap(({ mode, transaction }) =>
      transaction.entries.map((entry) => ({
        transactionId: transaction.id,
        mode,
        accountKind: entry.account.kind,
        accountOwner: entry.account.owner,
        direction: entry.direction,
        amount: BigInt(entry.amount.amount),
        currency: entry.amount.currency,
      })),
    ),
  });
}

/** Events in one insert, the merchants' endpoints in one lookup, deliveries in one insert, in event order. */
async function writeEvents(tx: Tx, events: readonly StoredEvent[]): Promise<void> {
  if (events.length === 0) return;
  await tx.event.createMany({
    data: events.map(({ merchantId, mode, event }) => ({
      id: event.id,
      merchantId,
      mode,
      type: event.type,
      data: toJsonObject(event.data),
      createdAt: new Date(event.created * 1000),
    })),
  });
  const scopes = new Map(
    events.map(({ merchantId, mode }) => [`${merchantId}:${mode}`, { merchantId, mode }]),
  );
  const endpoints = await tx.webhookEndpoint.findMany({
    where: { disabledAt: null, OR: [...scopes.values()] },
    select: { id: true, merchantId: true, mode: true, enabledEvents: true },
  });
  const deliveries = events.flatMap(({ merchantId, mode, event }) =>
    endpoints
      .filter(
        (e) =>
          e.merchantId === merchantId &&
          e.mode === mode &&
          endpointAccepts(e.enabledEvents, event.type),
      )
      .map((e) => ({ eventId: event.id, endpointId: e.id })),
  );
  if (deliveries.length > 0) await tx.webhookDelivery.createMany({ data: deliveries });
}
