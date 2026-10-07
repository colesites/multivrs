import type { ApiKeyMode } from "@vrs-pay/core";
import type { PriceInterval } from "./catalog.types";

/** The public shape of a payment link. */
export interface PaymentLink {
  id: string;
  object: "payment_link";
  livemode: boolean;
  /** Share this: each visit opens a fresh hosted checkout. */
  url: string;
  /** The product price it sells, or null for a quick fixed-amount link. */
  price: string | null;
  /** `one_time` takes a payment; `month`/`year` starts a subscription. */
  interval: PriceInterval;
  /** Per payment, or per period for a subscription. */
  amount: number;
  currency: string;
  description: string;
  after_payment_url: string | null;
  active: boolean;
  created: number;
}

export interface StoredPaymentLink {
  merchantId: string;
  mode: ApiKeyMode;
  link: Omit<PaymentLink, "url">;
}
