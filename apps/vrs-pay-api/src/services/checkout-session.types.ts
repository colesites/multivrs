import type { ApiKeyMode, PaymentMethod, ProviderId } from "@vrs-pay/core";

export type CheckoutSessionStatus = "open" | "complete" | "expired";

/** The public shape of a checkout session (what the API returns). */
export interface CheckoutSession {
  id: string;
  object: "checkout.session";
  livemode: boolean;
  status: CheckoutSessionStatus;
  /** `subscription` sessions start a subscription (and may only save a card, for trials). */
  mode: "payment" | "subscription";
  customer: string | null;
  subscription: string | null;
  /** Set when the session was opened from a payment link. */
  payment_link: string | null;
  /** Minor units, e.g. 4900 = £49.00. */
  amount: number;
  /** Lowercase ISO code, e.g. "gbp". */
  currency: string;
  payment_method: PaymentMethod;
  description: string | null;
  /** The provider the router picked for this payment. */
  provider: ProviderId;
  provider_reference: string;
  /** Where to send the customer to pay. */
  url: string;
  /** VRS Pay's application fee, minor units. */
  platform_fee: number;
  success_url: string;
  cancel_url: string;
  customer_email: string | null;
  metadata: Record<string, string>;
  /** Unix seconds. */
  created: number;
}

/** A session plus who owns it — the stored record, never returned as-is. */
export interface StoredCheckoutSession {
  merchantId: string;
  mode: ApiKeyMode;
  session: CheckoutSession;
}
