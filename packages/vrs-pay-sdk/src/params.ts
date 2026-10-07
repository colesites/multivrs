import type { Interval, PriceInterval } from "./types";

/** A price to create; `amount` is in minor units (900 is £9.00). */
export interface PriceParams {
  amount: number;
  currency: string;
  interval?: PriceInterval;
  interval_count?: number;
  usage_type?: "licensed" | "metered";
  aggregate_usage?: "sum" | "max" | "last";
  currency_options?: Record<string, { amount: number }>;
  nickname?: string;
  lookup_key?: string;
}

export interface ProductParams {
  name: string;
  description?: string;
  prices: PriceParams[];
  trial_days?: number;
  features?: Record<string, boolean | number>;
  images?: string[];
  marketing_features?: Array<{ name: string }>;
  metadata?: Record<string, string>;
}

export type ProductUpdate = Partial<Omit<ProductParams, "prices">> & { active?: boolean };

export interface CustomerParams {
  /** Your own id for this user or organization. */
  external_id: string;
  type?: "user" | "org";
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
}

/** For an existing customer (`customer`), or by your id (`external_id`, created on first use). */
export type CustomerSessionParams =
  | { customer: string }
  | { external_id: string; type?: "user" | "org"; email?: string; name?: string };

export interface PaymentCheckoutParams {
  mode?: "payment";
  amount: number;
  currency: string;
  description?: string;
  success_url: string;
  cancel_url: string;
  customer_email?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionCheckoutParams {
  mode: "subscription";
  price: string;
  customer: string;
  quantity?: number;
  currency?: string;
  success_url: string;
  cancel_url: string;
  metadata?: Record<string, string>;
}

export interface UsageParams {
  quantity: number;
  /** Unix seconds; now by default. */
  timestamp?: number;
}

/** `vrs-pay.config.ts`: features, then plans that use them. Prices are in minor units. */
export interface BillingConfig {
  features?: Record<string, "boolean" | "limit" | { type: "boolean" | "limit"; name?: string }>;
  plans?: Record<
    string,
    {
      name: string;
      description?: string;
      payer?: "user" | "org";
      trial_days?: number;
      features?: Record<string, boolean | number>;
      prices?: Partial<
        Record<Extract<Interval, "month" | "year"> | "one_time", Record<string, number>>
      >;
    }
  >;
}
