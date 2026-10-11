import type { ApiKeyMode, ProviderId, ProviderRefundStatus, RefundReason } from "@vrs-pay/core";

/** The public shape of a refund (what the API returns). */
export interface Refund {
  id: string;
  object: "refund";
  livemode: boolean;
  status: ProviderRefundStatus;
  /** Minor units. */
  amount: number;
  /** The part of `amount` that is tax returned to the buyer, minor units. */
  amount_tax: number;
  /** Lowercase ISO code. */
  currency: string;
  payment: string;
  provider_reference: string | null;
  reason: RefundReason | null;
  metadata: Record<string, string>;
  /** Unix seconds. */
  created: number;
}

export interface StoredRefund {
  merchantId: string;
  mode: ApiKeyMode;
  provider: ProviderId;
  refund: Refund;
}

export interface RefundUpdate {
  status: ProviderRefundStatus;
  providerReference: string | null;
}
