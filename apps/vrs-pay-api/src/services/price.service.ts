import { resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { CreatePriceInput, UpdatePriceInput } from "../routes/product.schema";
import type { Price } from "./catalog.types";
import { catalogChanges, newPrice } from "./catalog-compare";
import { nowSeconds } from "./events";
import { assertChargeable } from "./platform";
import { claimLookupKey, priceDetails } from "./price-details";
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
  const details = priceDetails(deps, input);
  const plans = await loadPlans(deps, merchant);
  const moved = claimLookupKey(plans, details.lookup_key, null, input.transfer_lookup_key);
  const price = newPrice(plan.id, input, merchant.mode === "live", nowSeconds(), details);
  await deps.catalog.apply(
    scopeOf(merchant),
    catalogChanges({ updatePrices: moved, createPrices: [price] }),
  );
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

/** `GET /v1/prices`: newest first, optionally only those with the given lookup keys. */
export async function listPrices(
  deps: AppDeps,
  merchant: MerchantContext,
  filter: { lookupKeys: string[]; active?: boolean },
): Promise<ProductPrice[]> {
  const wanted = (p: Price) =>
    filter.lookupKeys.length === 0 ||
    (p.lookup_key !== null && filter.lookupKeys.includes(p.lookup_key));
  return (await loadPlans(deps, merchant))
    .flatMap((plan) => plan.prices)
    .filter((p) => wanted(p) && (filter.active === undefined || p.active === filter.active))
    .sort((a, b) => b.created - a.created)
    .map(toProductPrice);
}

/**
 * Archive a price (existing subscribers keep paying it) or put it back on
 * sale; rename it or change its lookup key. Amounts never change.
 */
export async function updatePrice(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
  input: UpdatePriceInput,
): Promise<ProductPrice> {
  const { plan, price } = await findPrice(deps, merchant, id);
  editable(plan);
  const next: Price = {
    ...price,
    active: input.active ?? price.active,
    nickname: input.nickname === undefined ? price.nickname : input.nickname,
    lookup_key: input.lookup_key === undefined ? price.lookup_key : input.lookup_key,
  };
  const changes = catalogChanges();
  if (next.active !== price.active) {
    (next.active ? changes.activatePriceIds : changes.deactivatePriceIds).push(id);
  }
  if (next.nickname !== price.nickname || next.lookup_key !== price.lookup_key) {
    const plans = await loadPlans(deps, merchant);
    changes.updatePrices.push(
      ...claimLookupKey(plans, next.lookup_key, id, input.transfer_lookup_key),
      { id, nickname: next.nickname, lookup_key: next.lookup_key },
    );
  }
  await deps.catalog.apply(scopeOf(merchant), changes);
  return toProductPrice(next);
}
