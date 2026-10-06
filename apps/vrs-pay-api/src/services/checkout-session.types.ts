import type { ApiKeyMode, PaymentMethod, ProviderId } from "@vrs-pay/core";

/** The public shape of a checkout session (what the API returns). */
export interface CheckoutSession {
  id: string;
  object: "checkout.session";
  livemode: boolean;
  status: "open";
  /** Minor units, e.g. 4900 = £49.00. */
  amount: number;
  /** Lowercase ISO code, e.g. "gbp". */
  currency: string;
  payment_method: PaymentMethod;
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
