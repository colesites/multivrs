import type { ApiKeyMode, CurrencyCode } from "@vrs-pay/core";
import type { BillingInterval } from "./subscription.types";

export type FeatureType = "boolean" | "limit";
export type PlanPayer = "user" | "org";
export type PriceInterval = BillingInterval | "one_time";
/** `licensed` charges a fixed amount up front each period; `metered` charges reported usage after it. */
export type UsageType = "licensed" | "metered";
/** How a metered period's usage records add up: their total, the highest, or the latest. */
export type AggregateUsage = "sum" | "max" | "last";
/** Plans come from the config sync; products are made in the dashboard or API. */
export type ProductSource = "config" | "dashboard";
/** true for a boolean feature, a number for a limit. */
export type FeatureValue = boolean | number;

export interface Feature {
  id: string;
  object: "feature";
  livemode: boolean;
  key: string;
  name: string;
  type: FeatureType;
  created: number;
}

export interface Price {
  id: string;
  object: "price";
  livemode: boolean;
  plan: string;
  interval: PriceInterval;
  /** Intervals per charge: `month` × 3 is every 3 months. Always 1 for one_time. */
  interval_count: number;
  /** Lowercase ISO code. */
  currency: string;
  /** Minor units; per unit of usage for metered prices. */
  amount: number;
  usage_type: UsageType;
  /** Metered prices only. */
  aggregate_usage: AggregateUsage | null;
  /** Other currencies it sells in, like Stripe's: lowercase code → amount. */
  currency_options: Record<string, CurrencyOption>;
  /** Your own label for it ("Launch discount"); customers never see it. */
  nickname: string | null;
  /** A stable name for it, unique in the account, to fetch it by instead of its id. */
  lookup_key: string | null;
  active: boolean;
  created: number;
}

export interface CurrencyOption {
  /** Minor units. */
  amount: number;
}

/** The parts of a price that can change after it's made. */
export type PriceLabels = Pick<Price, "id" | "nickname" | "lookup_key">;

/** What a price gets beyond its slot; config prices have none of it. */
export type PriceDetails = Pick<
  Price,
  "currency_options" | "nickname" | "lookup_key" | "usage_type" | "aggregate_usage"
>;
export const NO_PRICE_DETAILS: PriceDetails = {
  currency_options: {},
  nickname: null,
  lookup_key: null,
  usage_type: "licensed",
  aggregate_usage: null,
};

export interface Plan {
  id: string;
  object: "plan";
  livemode: boolean;
  key: string;
  name: string;
  description: string | null;
  payer: PlanPayer;
  trial_days: number;
  features: Record<string, FeatureValue>;
  /** Image URLs for checkout and pricing pages, as on Stripe. */
  images: string[];
  /** Selling points for a pricing page ("Unlimited projects"). */
  marketing_features: MarketingFeature[];
  metadata: Record<string, string>;
  active: boolean;
  source: ProductSource;
  prices: Price[];
  created: number;
}

export interface MarketingFeature {
  name: string;
}

/** What a new plan starts with: no trial, features or extras. */
export const NO_EXTRAS = { images: [], marketing_features: [], metadata: {} } satisfies Pick<
  Plan,
  "images" | "marketing_features" | "metadata"
>;

/** A merchant's whole catalog in one mode, inactive plans and prices included. */
export interface Catalog {
  features: Feature[];
  plans: Plan[];
}

/** What a sync writes, applied atomically by the catalog store. */
export interface CatalogChanges {
  upsertFeatures: Feature[];
  deleteFeatureIds: string[];
  /** Plans to create or update (prices are ignored here). */
  upsertPlans: Plan[];
  /** Deactivated before `createPrices`, so a slot never has two active prices. */
  deactivatePriceIds: string[];
  /** Archived prices put back on sale (dashboard products only). */
  activatePriceIds: string[];
  /** New nicknames and lookup keys, applied before `createPrices` so a key can move. */
  updatePrices: PriceLabels[];
  createPrices: Price[];
}

export interface CatalogScope {
  merchantId: string;
  mode: ApiKeyMode;
}

export interface PriceSlot {
  interval: PriceInterval;
  interval_count: number;
  currency: CurrencyCode;
  amount: number;
}
