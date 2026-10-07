import type { PaymentMethod, ProviderCheckoutInput } from "@vrs-pay/core";
import type Stripe from "stripe";
import { descriptorSuffix } from "./stripe-options";

export const SESSION_METADATA_KEY = "vrs_session_id";
const DEFAULT_LINE_ITEM_NAME = "Payment";

/** Apple Pay and Google Pay ride on the card method in Stripe Checkout. */
const STRIPE_METHODS: Partial<
  Record<PaymentMethod, Stripe.Checkout.SessionCreateParams.PaymentMethodType>
> = {
  card: "card",
  apple_pay: "card",
  google_pay: "card",
  sepa_debit: "sepa_debit",
};

/**
 * Checkout Session params for a direct charge on the connected account.
 * Payment mode charges now (optionally saving the card); setup mode only
 * saves the card, e.g. to start a trial.
 */
export function checkoutParams(input: ProviderCheckoutInput): Stripe.Checkout.SessionCreateParams {
  const metadata = { ...input.metadata, [SESSION_METADATA_KEY]: input.sessionId };
  const shared = {
    payment_method_types: [STRIPE_METHODS[input.method] ?? "card"],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    client_reference_id: input.sessionId,
    metadata,
    ...(input.providerCustomer
      ? { customer: input.providerCustomer }
      : { customer_email: input.customerEmail }),
  };
  if (input.mode === "setup") {
    return {
      ...shared,
      mode: "setup",
      currency: input.amount.currency.toLowerCase(),
      setup_intent_data: { metadata: { [SESSION_METADATA_KEY]: input.sessionId } },
    };
  }
  const fee = input.platformFee.amount;
  const suffix = descriptorSuffix(input.statementDescriptor);
  return {
    ...shared,
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.amount.currency.toLowerCase(),
          unit_amount: input.amount.amount,
          product_data: { name: input.description ?? DEFAULT_LINE_ITEM_NAME },
        },
      },
    ],
    payment_intent_data: {
      // Our fee is a separate application fee only on a merchant's own account.
      ...(fee > 0 && input.merchantAccountId ? { application_fee_amount: fee } : {}),
      ...(suffix ? { statement_descriptor_suffix: suffix } : {}),
      ...(input.saveMethod ? { setup_future_usage: "off_session" as const } : {}),
      metadata: { [SESSION_METADATA_KEY]: input.sessionId },
    },
  };
}
