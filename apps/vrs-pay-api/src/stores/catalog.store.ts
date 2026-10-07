import type { Catalog, CatalogChanges, CatalogScope } from "../services/catalog.types";

/** Features, plans and prices for one merchant and mode. */
export interface CatalogStore {
  load(scope: CatalogScope): Promise<Catalog>;
  /** Writes a sync's changes atomically. */
  apply(scope: CatalogScope, changes: CatalogChanges): Promise<void>;
}
