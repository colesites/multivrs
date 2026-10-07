import type { ApiKeyMode, CurrencyCode } from "@vrs-pay/core";

export type FeatureType = "boolean" | "limit";
export type PlanPayer = "user" | "org";
export type PriceInterval = "month" | "year" | "one_time";
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
  /** Lowercase ISO code. */
  currency: string;
  /** Minor units. */
  amount: number;
  active: boolean;
  created: number;
}

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
  active: boolean;
  source: ProductSource;
  prices: Price[];
  created: number;
}

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
  createPrices: Price[];
}

export interface CatalogScope {
  merchantId: string;
  mode: ApiKeyMode;
}

export interface PriceSlot {
  interval: PriceInterval;
  currency: CurrencyCode;
  amount: number;
}
