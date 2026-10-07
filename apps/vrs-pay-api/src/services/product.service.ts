import { invalidRequest, newId, resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { CreateProductInput, UpdateProductInput } from "../routes/product.schema";
import type { Plan, Price } from "./catalog.types";
import { catalogChanges, newPrice } from "./catalog-compare";
import { nowSeconds } from "./events";
import { assertChargeable } from "./platform";
import { claimLookupKey, priceDetails } from "./price-details";
import type { Product, ProductPrice } from "./product.types";

export const scopeOf = (merchant: MerchantContext) => ({
  merchantId: merchant.id,
  mode: merchant.mode,
});

export function toProductPrice({ plan, ...price }: Price): ProductPrice {
  return { ...price, product: plan };
}

export function toProduct(plan: Plan): Product {
  const { id, livemode, name, description, active, trial_days, features, source, created } = plan;
  const { images, marketing_features, metadata } = plan;
  return {
    id,
    object: "product",
    livemode,
    name,
    description,
    active,
    trial_days,
    features,
    images,
    marketing_features,
    metadata,
    source,
    prices: plan.prices.map(toProductPrice),
    created,
  };
}

/** A feature declared in the billing config keeps its type: true/false or a limit. */
async function assertFeatureTypes(
  deps: AppDeps,
  merchant: MerchantContext,
  features: Plan["features"] | undefined,
) {
  if (!features) return;
  const declared = (await deps.catalog.load(scopeOf(merchant))).features;
  for (const [key, value] of Object.entries(features)) {
    const feature = declared.find((f) => f.key === key);
    if (feature && (feature.type === "boolean") !== (typeof value === "boolean")) {
      const expected = feature.type === "boolean" ? "true or false" : "a number";
      throw invalidRequest("feature_type_mismatch", `${key} takes ${expected}.`, `features.${key}`);
    }
  }
}

export async function loadPlans(deps: AppDeps, merchant: MerchantContext) {
  return (await deps.catalog.load(scopeOf(merchant))).plans;
}

/** Config plans change only by editing the config and syncing it. */
export function editable(plan: Plan): Plan {
  if (plan.source === "config") {
    throw invalidRequest(
      "product_managed_by_config",
      "This product comes from your billing config. Change it there and sync.",
    );
  }
  return plan;
}

export async function findPlan(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
): Promise<Plan> {
  const plan = (await loadPlans(deps, merchant)).find((p) => p.id === id);
  if (!plan) throw resourceMissing("product", id);
  return plan;
}

/** Newest first. */
export async function listProducts(deps: AppDeps, merchant: MerchantContext, active?: boolean) {
  const plans = await loadPlans(deps, merchant);
  return plans
    .filter((p) => active === undefined || p.active === active)
    .sort((a, b) => b.created - a.created)
    .map(toProduct);
}

export async function getProduct(deps: AppDeps, merchant: MerchantContext, id: string) {
  return toProduct(await findPlan(deps, merchant, id));
}

export async function createProduct(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreateProductInput,
): Promise<Product> {
  const now = nowSeconds();
  const livemode = merchant.mode === "live";
  const id = newId("product");
  // Dashboard products use their id as the key; config keys are lowercase, so they never clash.
  const plan: Plan = {
    id,
    object: "plan",
    livemode,
    key: id,
    name: input.name,
    description: input.description || null,
    payer: "user",
    trial_days: input.trial_days,
    features: input.features,
    images: input.images,
    marketing_features: input.marketing_features,
    metadata: input.metadata,
    active: true,
    source: "dashboard",
    prices: [],
    created: now,
  };
  for (const price of input.prices) assertChargeable(deps, price.currency);
  await assertFeatureTypes(deps, merchant, input.features);
  const keys = input.prices.flatMap((p) => p.lookup_key ?? []);
  if (new Set(keys).size !== keys.length) {
    throw invalidRequest("lookup_key_taken", "Two prices can't share a lookup key.", "prices");
  }
  const existing = await loadPlans(deps, merchant);
  for (const key of keys) claimLookupKey(existing, key, null, false);
  const prices = input.prices.map((p) => newPrice(id, p, livemode, now, priceDetails(deps, p)));
  await deps.catalog.apply(
    scopeOf(merchant),
    catalogChanges({ upsertPlans: [plan], createPrices: prices }),
  );
  return toProduct({ ...plan, prices });
}

export async function updateProduct(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  const plan = editable(await findPlan(deps, merchant, id));
  await assertFeatureTypes(deps, merchant, input.features);
  const next: Plan = {
    ...plan,
    name: input.name ?? plan.name,
    description: input.description === undefined ? plan.description : input.description || null,
    active: input.active ?? plan.active,
    trial_days: input.trial_days ?? plan.trial_days,
    features: input.features ?? plan.features,
    images: input.images ?? plan.images,
    marketing_features: input.marketing_features ?? plan.marketing_features,
    metadata: input.metadata ?? plan.metadata,
  };
  await deps.catalog.apply(scopeOf(merchant), catalogChanges({ upsertPlans: [next] }));
  return toProduct(next);
}
