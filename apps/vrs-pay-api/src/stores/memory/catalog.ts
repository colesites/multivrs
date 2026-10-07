import type { Catalog } from "../../services/catalog.types";
import type { CatalogStore } from "../catalog.store";

/** Mirrors the database's `prices_one_active_per_slot` index: config plans only. */
function assertOneActivePerSlot(catalog: Catalog) {
  for (const plan of catalog.plans.filter((p) => p.source === "config")) {
    const slots = plan.prices.filter((p) => p.active).map((p) => `${p.interval}:${p.currency}`);
    if (new Set(slots).size !== slots.length) {
      throw new Error(`Unique constraint failed: two active prices in one slot of ${plan.id}`);
    }
  }
}

/** In-memory catalogs keyed `${merchantId}:${mode}`. */
export function createMemoryCatalogStore(catalogs = new Map<string, Catalog>()): CatalogStore {
  const keyOf = ({ merchantId, mode }: { merchantId: string; mode: string }) =>
    `${merchantId}:${mode}`;
  return {
    async load(scope) {
      return structuredClone(catalogs.get(keyOf(scope)) ?? { features: [], plans: [] });
    },
    async apply(scope, changes) {
      const catalog = structuredClone(catalogs.get(keyOf(scope)) ?? { features: [], plans: [] });
      const deleted = new Set(changes.deleteFeatureIds);
      catalog.features = catalog.features.filter((f) => !deleted.has(f.id));
      for (const feature of changes.upsertFeatures) {
        catalog.features = [...catalog.features.filter((f) => f.id !== feature.id), feature];
      }
      for (const plan of changes.upsertPlans) {
        const prices = catalog.plans.find((p) => p.id === plan.id)?.prices ?? [];
        catalog.plans = [...catalog.plans.filter((p) => p.id !== plan.id), { ...plan, prices }];
      }
      const deactivated = new Set(changes.deactivatePriceIds);
      const activated = new Set(changes.activatePriceIds);
      for (const plan of catalog.plans) {
        plan.prices = plan.prices.map((p) =>
          deactivated.has(p.id) || activated.has(p.id) ? { ...p, active: activated.has(p.id) } : p,
        );
        plan.prices.push(...changes.createPrices.filter((p) => p.plan === plan.id));
      }
      assertOneActivePerSlot(catalog);
      catalogs.set(keyOf(scope), catalog);
    },
  };
}
