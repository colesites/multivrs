import type { ApiKeyMode, ProviderId } from "@vrs-pay/core";

export type PaymentStatus = "succeeded" | "partially_refunded" | "refunded";

/** The public shape of a payment (what the API returns). */
export interface Payment {
  id: string;
  object: "payment";
  livemode: boolean;
  status: PaymentStatus;
  /** Minor units. */
  amount: number;
  amount_refunded: number;
  /** Lowercase ISO code. */
  currency: string;
  /** VRS Pay's application fee, minor units. */
  platform_fee: number;
  /** What the provider charged, minor units (0 if it settled in another currency). */
  provider_fee: number;
  provider: ProviderId;
  provider_reference: string;
  checkout_session: string | null;
  customer_email: string | null;
  metadata: Record<string, string>;
  /** Unix seconds. */
  created: number;
}

export interface StoredPayment {
  merchantId: string;
  mode: ApiKeyMode;
  /** The connected account / subaccount the charge was made on. */
  providerAccountId: string;
  payment: Payment;
}
