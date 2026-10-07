import { resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { CreatePriceInput } from "../routes/product.schema";
import { catalogChanges, newPrice } from "./catalog-compare";
import { nowSeconds } from "./events";
import { assertChargeable } from "./platform";
import { editable, findPlan, loadPlans, scopeOf, toProductPrice } from "./product.service";
import type { ProductPrice } from "./product.types";

/** A product can have any number of prices: other currencies, periods or amounts. */
export async function createPrice(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreatePriceInput,
): Promise<ProductPrice> {
  const plan = editable(await findPlan(deps, merchant, input.product));
  assertChargeable(deps, input.currency);
  const price = newPrice(plan.id, input, merchant.mode === "live", nowSeconds());
  await deps.catalog.apply(scopeOf(merchant), catalogChanges({ createPrices: [price] }));
  return toProductPrice(price);
}

/** A price and the product it belongs to. */
export async function findPrice(deps: AppDeps, merchant: MerchantContext, id: string) {
  for (const plan of await loadPlans(deps, merchant)) {
    const price = plan.prices.find((p) => p.id === id);
    if (price) return { plan, price };
  }
  throw resourceMissing("price", id);
}

/** Archive a price (existing subscribers keep paying it) or put it back on sale. */
export async function setPriceActive(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
  active: boolean,
): Promise<ProductPrice> {
  const { plan, price } = await findPrice(deps, merchant, id);
  editable(plan);
  const ids = [price.id];
  await deps.catalog.apply(
    scopeOf(merchant),
    catalogChanges(active ? { activatePriceIds: ids } : { deactivatePriceIds: ids }),
  );
  return toProductPrice({ ...price, active });
}
