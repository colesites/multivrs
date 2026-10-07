import type { ApiKeyMode } from "@vrs-pay/core";
import type { AggregateUsage } from "./catalog.types";

/** Usage reported for a metered subscription, like Stripe's usage records. */
export interface UsageRecord {
  id: string;
  object: "usage_record";
  livemode: boolean;
  subscription: string;
  quantity: number;
  /** When the usage happened (Unix seconds); it counts toward the period this falls in. */
  timestamp: number;
}

export interface StoredUsageRecord {
  merchantId: string;
  mode: ApiKeyMode;
  record: UsageRecord;
}

/** A period's usage, added up by the price's aggregate_usage. */
export interface UsageWindow {
  subscriptionId: string;
  /** Inclusive, Unix seconds. */
  from: number;
  /** Exclusive, Unix seconds. */
  to: number;
  aggregate: AggregateUsage;
}
