import { toCurrency, toMinor, toUnix } from "../../db/convert";
import type {
  Invoice as InvoiceRow,
  PaymentMethod as MethodRow,
  Subscription as SubscriptionRow,
} from "../../generated/prisma/client";
import { InvoiceLinesSchema } from "../../services/invoice-lines";
import type {
  PaymentMethodRecord,
  StoredInvoice,
  StoredSubscription,
} from "../../services/subscription.types";
import { toJsonArray } from "./effects";

const unixOrNull = (date: Date | null) => (date ? toUnix(date) : null);
const dateOrNull = (seconds: number | null) => (seconds === null ? null : new Date(seconds * 1000));

export function subscriptionFromRow(row: SubscriptionRow): StoredSubscription {
  return {
    merchantId: row.merchantId,
    mode: row.mode,
    provider: row.provider,
    version: row.version,
    usageFrom: unixOrNull(row.usageFrom),
    subscription: {
      id: row.id,
      object: "subscription",
      livemode: row.mode === "live",
      customer: row.customerId,
      plan: row.planId,
      price: row.priceId,
      status: row.status,
      quantity: row.quantity,
      currency: toCurrency(row.currency).toLowerCase(),
      current_period_start: unixOrNull(row.currentPeriodStart),
      current_period_end: unixOrNull(row.currentPeriodEnd),
      trial_end: unixOrNull(row.trialEnd),
      cancel_at_period_end: row.cancelAtPeriodEnd,
      canceled_at: unixOrNull(row.canceledAt),
      pending_price: row.pendingPriceId,
      pending_quantity: row.pendingQuantity,
      payment_method: row.paymentMethodId,
      created: toUnix(row.createdAt),
    },
  };
}

export function subscriptionRow({
  merchantId,
  mode,
  provider,
  version,
  usageFrom,
  subscription: s,
}: StoredSubscription) {
  return {
    merchantId,
    mode,
    provider,
    version,
    usageFrom: dateOrNull(usageFrom ?? null),
    customerId: s.customer,
    planId: s.plan,
    priceId: s.price,
    status: s.status,
    quantity: s.quantity,
    currency: s.currency.toUpperCase(),
    currentPeriodStart: dateOrNull(s.current_period_start),
    currentPeriodEnd: dateOrNull(s.current_period_end),
    trialEnd: dateOrNull(s.trial_end),
    cancelAtPeriodEnd: s.cancel_at_period_end,
    canceledAt: dateOrNull(s.canceled_at),
    pendingPriceId: s.pending_price,
    pendingQuantity: s.pending_quantity,
    paymentMethodId: s.payment_method,
  };
}

export function invoiceFromRow(row: InvoiceRow): StoredInvoice {
  return {
    merchantId: row.merchantId,
    mode: row.mode,
    invoice: {
      id: row.id,
      object: "invoice",
      livemode: row.mode === "live",
      customer: row.customerId,
      subscription: row.subscriptionId,
      status: row.status,
      billing_reason: row.billingReason,
      currency: toCurrency(row.currency).toLowerCase(),
      subtotal: toMinor(row.subtotal),
      tax: toMinor(row.tax),
      total: toMinor(row.total),
      lines: InvoiceLinesSchema.parse(row.lines),
      period_start: toUnix(row.periodStart),
      period_end: toUnix(row.periodEnd),
      attempt_count: row.attemptCount,
      next_attempt_at: unixOrNull(row.nextAttemptAt),
      payment: row.paymentId,
      paid_at: unixOrNull(row.paidAt),
      created: toUnix(row.createdAt),
    },
  };
}

export function invoiceRow({ merchantId, mode, invoice: i }: StoredInvoice) {
  return {
    merchantId,
    mode,
    customerId: i.customer,
    subscriptionId: i.subscription,
    status: i.status,
    billingReason: i.billing_reason,
    currency: i.currency.toUpperCase(),
    subtotal: BigInt(i.subtotal),
    tax: BigInt(i.tax),
    total: BigInt(i.total),
    lines: toJsonArray(i.lines),
    periodStart: new Date(i.period_start * 1000),
    periodEnd: new Date(i.period_end * 1000),
    attemptCount: i.attempt_count,
    nextAttemptAt: dateOrNull(i.next_attempt_at),
    paymentId: i.payment,
    paidAt: dateOrNull(i.paid_at),
  };
}

export function methodFromRow(row: MethodRow): PaymentMethodRecord {
  const { id, customerId, provider, providerRef, brand, last4, expMonth, expYear } = row;
  return { id, customerId, provider, providerRef, brand, last4, expMonth, expYear };
}
