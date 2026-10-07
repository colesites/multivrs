/** The objects the VRS Pay API returns. Amounts are in minor units (pence, cents, kobo). */

export interface List<T> {
  object: "list";
  data: T[];
}

export type Interval = "day" | "week" | "month" | "year";
export type PriceInterval = Interval | "one_time";

export interface Price {
  id: string;
  object: "price";
  livemode: boolean;
  product: string;
  interval: PriceInterval;
  interval_count: number;
  currency: string;
  /** Per unit of usage for metered prices. */
  amount: number;
  usage_type: "licensed" | "metered";
  aggregate_usage: "sum" | "max" | "last" | null;
  currency_options: Record<string, { amount: number }>;
  nickname: string | null;
  lookup_key: string | null;
  active: boolean;
  created: number;
}

export interface Product {
  id: string;
  object: "product";
  livemode: boolean;
  name: string;
  description: string | null;
  active: boolean;
  trial_days: number;
  features: Record<string, boolean | number>;
  images: string[];
  marketing_features: Array<{ name: string }>;
  metadata: Record<string, string>;
  source: "config" | "dashboard";
  prices: Price[];
  created: number;
}

export interface Customer {
  id: string;
  object: "customer";
  livemode: boolean;
  external_id: string;
  type: "user" | "org";
  email: string | null;
  name: string | null;
  metadata: Record<string, string>;
  created: number;
}

export interface CustomerSession {
  id: string;
  object: "customer_session";
  livemode: boolean;
  customer: Customer;
  /** Hand this to the browser (@vrs-pay/js, @vrs-pay/react); it expires at `expires_at`. */
  client_secret: string;
  expires_at: number;
}
