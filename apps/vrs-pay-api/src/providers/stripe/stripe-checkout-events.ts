import { CurrencyCodeSchema, money, type ProviderWebhookEvent } from "@vrs-pay/core";
import type Stripe from "stripe";
import type { StripeApi } from "./stripe-api.types";
import { SESSION_METADATA_KEY } from "./stripe-checkout";
import { fetchChargeDetails, savedMethodFrom } from "./stripe-fees";
import { requestOptions } from "./stripe-options";

export type EventBase = Pick<ProviderWebhookEvent, "provider" | "id" | "account" | "occurredAt">;

export function ignored(base: EventBase, providerType: string): ProviderWebhookEvent {
  return { ...base, type: "ignored", data: { providerType } };
}

export function idOf(value: string | { id: string } | null): string | null {
  return typeof value === "string" ? value : (value?.id ?? null);
}

function sessionIdOf(session: Stripe.Checkout.Session): string | null {
  return session.metadata?.[SESSION_METADATA_KEY] ?? session.client_reference_id;
}

/** A setup-mode checkout saved a card: read it off the SetupIntent. */
async function setupCompleted(
  api: StripeApi,
  base: EventBase,
  type: string,
  session: Stripe.Checkout.Session,
): Promise<ProviderWebhookEvent> {
  const setupIntent = idOf(session.setup_intent);
  if (!setupIntent) return ignored(base, type);
  const intent = await api.setupIntents.retrieve(
    setupIntent,
    { expand: ["payment_method"] },
    requestOptions(base.account),
  );
  const savedMethod = savedMethodFrom(intent.payment_method);
  if (intent.status !== "succeeded" || !savedMethod) return ignored(base, type);
  return {
    ...base,
    type: "checkout.setup_completed",
    data: {
      sessionReference: session.id,
      sessionId: sessionIdOf(session),
      customerEmail: session.customer_details?.email ?? null,
      customerName: session.customer_details?.name ?? null,
      customerCountry: session.customer_details?.address?.country ?? null,
      providerCustomer: idOf(session.customer),
      savedMethod,
    },
  };
}

/** A paid checkout (and, for subscriptions, the card it saved). */
export async function checkoutCompleted(
  api: StripeApi,
  base: EventBase,
  type: string,
  session: Stripe.Checkout.Session,
): Promise<ProviderWebhookEvent> {
  if (session.mode === "setup") return setupCompleted(api, base, type, session);
  const paymentIntent = idOf(session.payment_intent);
  const currency = CurrencyCodeSchema.safeParse(session.currency);
  const paid = session.mode === "payment" && session.payment_status === "paid";
  if (!paid || !paymentIntent || !currency.success || session.amount_total === null) {
    return ignored(base, type);
  }
  const details = await fetchChargeDetails(api, base.account, paymentIntent, currency.data);
  return {
    ...base,
    type: "checkout.completed",
    data: {
      sessionReference: session.id,
      sessionId: sessionIdOf(session),
      paymentReference: paymentIntent,
      amount: money(session.amount_total, currency.data),
      platformFee: details.platformFee,
      providerFee: details.providerFee,
      customerEmail: session.customer_details?.email ?? null,
      customerName: session.customer_details?.name ?? null,
      customerCountry: session.customer_details?.address?.country ?? null,
      savedMethod: details.savedMethod,
      providerCustomer: idOf(session.customer),
    },
  };
}
