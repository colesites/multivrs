import type { FeatureValue, MarketingFeature, Price, ProductSource } from "./catalog.types";

/** A price as listed under its product. */
export type ProductPrice = Omit<Price, "plan"> & { product: string };

/** Anything a merchant sells: made in the dashboard or API, or a plan from the config. */
export interface Product {
  id: string;
  object: "product";
  livemode: boolean;
  name: string;
  description: string | null;
  active: boolean;
  /** Free days before the first charge on new subscriptions. */
  trial_days: number;
  /** What subscribers get: feature key → true, or a limit. */
  features: Record<string, FeatureValue>;
  images: string[];
  marketing_features: MarketingFeature[];
  metadata: Record<string, string>;
  /** `config` products change only through a config sync. */
  source: ProductSource;
  /** Every price, archived ones included (`active: false`). */
  prices: ProductPrice[];
  created: number;
}
