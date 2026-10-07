import { Prisma } from "../../generated/prisma/client";
import type { BillingBatch } from "../billing.store";
import { invoiceRow, subscriptionRow } from "./billing-mappers";
import { type Tx, writeEffects } from "./effects";
import { paymentRow } from "./payment-row";

/** Thrown inside a transaction to roll it back when a batch conflicts. */
export class Conflict extends Error {}

export const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

/**
 * Saves cards first, since subscriptions point at them. A card the
 * provider already gave us keeps its stored id; the returned map sends
 * new ids to it.
 */
async function writePaymentMethods(tx: Tx, batch: BillingBatch): Promise<Map<string, string>> {
  const stored = new Map<string, string>();
  for (const method of batch.paymentMethods ?? []) {
    const { id, provider, providerRef, ...card } = method;
    const row = await tx.paymentMethod.upsert({
      where: { provider_providerRef: { provider, providerRef } },
      create: { id, provider, providerRef, ...card },
      update: {
        brand: card.brand,
        last4: card.last4,
        expMonth: card.expMonth,
        expYear: card.expYear,
      },
      select: { id: true },
    });
    if (row.id !== id) stored.set(id, row.id);
  }
  return stored;
}

export async function writeBatch(tx: Tx, batch: BillingBatch): Promise<void> {
  const methodIds = await writePaymentMethods(tx, batch);
  for (const { record, expectedVersion } of batch.subscriptions ?? []) {
    const row = subscriptionRow(record);
    const data = {
      ...row,
      paymentMethodId:
        row.paymentMethodId && (methodIds.get(row.paymentMethodId) ?? row.paymentMethodId),
    };
    if (expectedVersion === null) {
      const { subscription } = record;
      await tx.subscription.create({
        data: { id: subscription.id, ...data, createdAt: new Date(subscription.created * 1000) },
      });
      continue;
    }
    const { count } = await tx.subscription.updateMany({
      where: { id: record.subscription.id, version: expectedVersion },
      data,
    });
    if (count === 0) throw new Conflict();
  }
  for (const { record, create } of batch.invoices ?? []) {
    const data = invoiceRow(record);
    if (create) {
      await tx.invoice.create({
        data: {
          id: record.invoice.id,
          ...data,
          createdAt: new Date(record.invoice.created * 1000),
        },
      });
    } else {
      await tx.invoice.update({ where: { id: record.invoice.id }, data });
    }
  }
  const payments = batch.payments ?? [];
  if (payments.length > 0) {
    const { count } = await tx.payment.createMany({
      data: payments.map(paymentRow),
      skipDuplicates: true,
    });
    if (count !== payments.length) throw new Conflict();
  }
  if (batch.providerCustomers?.length) {
    await tx.providerCustomer.createMany({
      data: batch.providerCustomers.map((p) => ({
        customerId: p.customerId,
        provider: p.provider,
        externalRef: p.reference,
      })),
      skipDuplicates: true,
    });
  }
  if (batch.completeSession) {
    await tx.checkoutSession.update({
      where: { id: batch.completeSession },
      data: { status: "complete" },
    });
  }
  if (batch.effects) await writeEffects(tx, batch.effects);
}
