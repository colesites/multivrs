import { type CurrencyCode, type Money, money, type SavedMethod } from "@vrs-pay/core";
import type Stripe from "stripe";
import type { StripeApi } from "./stripe-api.types";
import { requestOptions } from "./stripe-options";

export interface StripeChargeDetails {
  platformFee: Money;
  providerFee: Money;
  /** The card, when the intent saved it for later (`setup_future_usage`). */
  savedMethod: SavedMethod | null;
}

/** Expand these on a PaymentIntent to read fees and the saved card. */
export const INTENT_EXPAND = ["latest_charge.balance_transaction", "payment_method"];

export function savedMethodFrom(method: string | Stripe.PaymentMethod | null): SavedMethod | null {
  if (!method) return null;
  if (typeof method === "string") {
    return { reference: method, brand: null, last4: null, expMonth: null, expYear: null };
  }
  const card = method.card;
  return {
    reference: method.id,
    brand: card?.brand ?? null,
    last4: card?.last4 ?? null,
    expMonth: card?.exp_month ?? null,
    expYear: card?.exp_year ?? null,
  };
}

/**
 * Fees on a direct charge, from the connected account's balance
 * transaction. Its `fee` bundles Stripe's fees and our application fee,
 * so they're split by `fee_details`. Stripe's fee is 0 when unknown yet or
 * settled in another currency.
 */
export function chargeDetails(
  intent: Stripe.PaymentIntent,
  currency: CurrencyCode,
): StripeChargeDetails {
  const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null;
  const balance =
    charge && typeof charge.balance_transaction === "object" ? charge.balance_transaction : null;
  const sameCurrency = balance?.currency.toUpperCase() === currency;
  const stripeFee = sameCurrency
    ? (balance?.fee_details ?? [])
        .filter((d) => d.type !== "application_fee")
        .reduce((sum, d) => sum + d.amount, 0)
    : 0;
  const saving = intent.setup_future_usage === "off_session";
  return {
    platformFee: money(charge?.application_fee_amount ?? 0, currency),
    providerFee: money(stripeFee, currency),
    savedMethod: saving ? savedMethodFrom(intent.payment_method) : null,
  };
}

export async function fetchChargeDetails(
  api: StripeApi,
  account: string | null,
  paymentIntentId: string,
  currency: CurrencyCode,
): Promise<StripeChargeDetails> {
  const intent = await api.paymentIntents.retrieve(
    paymentIntentId,
    { expand: INTENT_EXPAND },
    requestOptions(account),
  );
  return chargeDetails(intent, currency);
}
