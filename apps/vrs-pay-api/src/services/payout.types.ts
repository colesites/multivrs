import type { ApiKeyMode, ProviderId, ProviderPayoutStatus } from "@vrs-pay/core";

/** The public shape of a payout (what the API returns): money sent to the merchant's bank. */
export interface Payout {
  id: string;
  object: "payout";
  livemode: boolean;
  status: ProviderPayoutStatus;
  /** What reaches the bank account, minor units. */
  amount: number;
  /** The provider's transfer fee, taken from the balance with it, minor units. */
  fee: number;
  /** Lowercase ISO code. */
  currency: string;
  /** Who sends it: "paystack" for Nigerian banks. */
  rail: ProviderId;
  destination: { bank_name: string | null; last4: string | null };
  provider_reference: string;
  failure_message: string | null;
  /** Unix seconds. */
  created: number;
}

export interface StoredPayout {
  merchantId: string;
  mode: ApiKeyMode;
  /** UTC day it was made for (YYYY-MM-DD): one payout per merchant, currency and day. */
  day: string;
  payout: Payout;
}

export interface PayoutUpdate {
  status: "paid" | "failed";
  failureMessage: string | null;
}
