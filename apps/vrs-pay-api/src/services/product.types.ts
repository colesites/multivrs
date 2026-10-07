import type { Price, ProductSource } from "./catalog.types";

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
  /** `config` products change only through a config sync. */
  source: ProductSource;
  /** Every price, archived ones included (`active: false`). */
  prices: ProductPrice[];
  created: number;
}
