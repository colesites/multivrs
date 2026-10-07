import {
  CurrencyCodeSchema,
  money,
  type ProviderRefundStatus,
  type ProviderWebhookEvent,
} from "@vrs-pay/core";
import type Stripe from "stripe";
import type { StripeApi } from "./stripe-api.types";
import { checkoutCompleted, type EventBase, idOf, ignored } from "./stripe-checkout-events";

export const REFUND_METADATA_KEY = "vrs_refund_id";

/** Stripe refund status → ours (`requires_action` is still pending; `canceled` failed). */
export function refundStatusFrom(status: string | null): ProviderRefundStatus {
  if (status === "succeeded") return "succeeded";
  return status === "failed" || status === "canceled" ? "failed" : "pending";
}

function refundUpdated(
  base: EventBase,
  event: Stripe.Event,
  refund: Stripe.Refund,
): ProviderWebhookEvent {
  const paymentIntent = idOf(refund.payment_intent);
  const currency = CurrencyCodeSchema.safeParse(refund.currency);
  if (!paymentIntent || !currency.success) return ignored(base, event.type);
  return {
    ...base,
    type: "refund.updated",
    data: {
      refundReference: refund.id,
      refundId: refund.metadata?.[REFUND_METADATA_KEY] ?? null,
      paymentReference: paymentIntent,
      status: refundStatusFrom(refund.status),
      amount: money(refund.amount, currency.data),
    },
  };
}

/** Maps a verified Stripe event to the few things VRS Pay acts on. */
export async function toProviderEvent(
  api: StripeApi,
  event: Stripe.Event,
): Promise<ProviderWebhookEvent> {
  const base: EventBase = {
    provider: "stripe",
    id: event.id,
    account: event.account ?? null,
    occurredAt: event.created,
  };
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      return checkoutCompleted(api, base, event.type, event.data.object);
    case "checkout.session.expired":
      return {
        ...base,
        type: "checkout.expired",
        data: { sessionReference: event.data.object.id },
      };
    case "refund.created":
    case "refund.updated":
    case "refund.failed":
      return refundUpdated(base, event, event.data.object);
    case "account.updated": {
      const account = event.data.object;
      return {
        ...base,
        type: "account.updated",
        data: {
          accountId: account.id,
          chargesEnabled: account.charges_enabled ?? false,
          payoutsEnabled: account.payouts_enabled ?? false,
          detailsSubmitted: account.details_submitted ?? false,
        },
      };
    }
    default:
      return ignored(base, event.type);
  }
}
