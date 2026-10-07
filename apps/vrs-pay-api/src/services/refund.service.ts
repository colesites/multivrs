import {
  type CurrencyCode,
  CurrencyCodeSchema,
  invalidRequest,
  isVrsPayError,
  money,
  type ProviderRefund,
  resourceMissing,
} from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { CreateRefundInput } from "../routes/refund.schema";
import { accountOf, providersFor } from "./platform";
import type { Refund } from "./refund.types";
import { newRefund, refundEffects } from "./refund-effects";

function amountTooLarge(remaining: number) {
  return invalidRequest(
    "amount_too_large",
    `The refund amount is more than the ${remaining} left to refund on this payment.`,
    "amount",
  );
}

/**
 * Refunds all or part of a payment. The amount is reserved first so two
 * concurrent refunds can't go over the payment, then the provider is asked.
 */
export async function createRefund(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreateRefundInput,
): Promise<Refund> {
  const stored = await deps.payments.get(merchant.id, merchant.mode, input.payment);
  if (!stored) throw resourceMissing("payment", input.payment);
  const { payment } = stored;
  const remaining = payment.amount - payment.amount_refunded;
  if (remaining <= 0) {
    throw invalidRequest(
      "payment_already_refunded",
      "This payment is already fully refunded.",
      "payment",
    );
  }
  const amount = input.amount ?? remaining;
  if (amount > remaining) throw amountTooLarge(remaining);

  const record = newRefund(stored, amount, {
    reason: input.reason ?? null,
    metadata: input.metadata,
    provider_reference: null,
  });
  if (!(await deps.refunds.reserve(record))) throw amountTooLarge(remaining);

  const { id } = record.refund;
  const currency: CurrencyCode = CurrencyCodeSchema.parse(payment.currency);
  let outcome: ProviderRefund;
  try {
    outcome = await providersFor(deps, stored.mode)[payment.provider].refund({
      merchantAccountId: accountOf(stored),
      paymentReference: payment.provider_reference,
      amount: money(amount, currency),
      refundId: id,
      reason: input.reason,
      idempotencyKey: id,
    });
  } catch (error) {
    // A network failure may still have reached the provider: leave it
    // pending for the webhook to settle. A clear rejection frees the amount.
    const retryable = isVrsPayError(error) && error.details?.retryable === true;
    if (!retryable) {
      await deps.refunds.settle(id, { status: "failed", providerReference: null }, refundEffects);
    }
    throw error;
  }
  const update = { status: outcome.status, providerReference: outcome.reference };
  const settled = await deps.refunds.settle(id, update, refundEffects);
  // A webhook may have settled it first; return the latest state.
  return (
    settled?.refund ??
    (await deps.refunds.get(merchant.id, merchant.mode, id))?.refund ??
    record.refund
  );
}

export async function getRefund(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
): Promise<Refund> {
  const stored = await deps.refunds.get(merchant.id, merchant.mode, id);
  if (!stored) throw resourceMissing("refund", id);
  return stored.refund;
}
