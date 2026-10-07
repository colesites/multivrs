import { Prisma } from "../../generated/prisma/client";
import type { BillingBatch } from "../billing.store";
import { invoiceRow, subscriptionRow } from "./billing-mappers";
import { type Tx, writeEffects } from "./effects";
import { paymentRow } from "./payment-row";

/** Thrown inside a transaction to roll it back when a batch conflicts. */
export class Conflict extends Error {}

export const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export async function writeBatch(tx: Tx, batch: BillingBatch): Promise<void> {
  for (const { record, expectedVersion } of batch.subscriptions ?? []) {
    const data = subscriptionRow(record);
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
  for (const method of batch.paymentMethods ?? []) {
    const { id, provider, providerRef, ...card } = method;
    await tx.paymentMethod.upsert({
      where: { provider_providerRef: { provider, providerRef } },
      create: { id, provider, providerRef, ...card },
      update: {
        brand: card.brand,
        last4: card.last4,
        expMonth: card.expMonth,
        expYear: card.expYear,
      },
    });
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
