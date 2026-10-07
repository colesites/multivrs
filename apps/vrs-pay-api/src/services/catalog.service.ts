import { resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { BillingConfig } from "../routes/billing-config.schema";
import type { Plan } from "./catalog.types";
import { diffCatalog } from "./catalog-diff";
import { nowSeconds } from "./events";

const scopeOf = (merchant: MerchantContext) => ({ merchantId: merchant.id, mode: merchant.mode });

/** What customers can buy: the plan with only its active prices. */
function forSale(plan: Plan): Plan {
  return { ...plan, prices: plan.prices.filter((p) => p.active) };
}

/** Applies a whole billing config. Safe to run on every deploy. */
export async function syncCatalog(deps: AppDeps, merchant: MerchantContext, config: BillingConfig) {
  const scope = scopeOf(merchant);
  const current = await deps.catalog.load(scope);
  const { changes, summary } = diffCatalog(current, config, merchant.mode === "live", nowSeconds());
  const changed = Object.values(summary).some((list) => list.length > 0);
  if (changed) await deps.catalog.apply(scope, changes);
  const next = changed ? await deps.catalog.load(scope) : current;
  return {
    object: "billing_sync" as const,
    changed,
    ...summary,
    features: next.features,
    plans: next.plans.filter((p) => p.active && p.source === "config").map(forSale),
  };
}

/** The config's plans; dashboard products are listed under /v1/products. */
async function configPlans(deps: AppDeps, merchant: MerchantContext) {
  const { plans } = await deps.catalog.load(scopeOf(merchant));
  return plans.filter((p) => p.source === "config");
}

export async function listPlans(
  deps: AppDeps,
  merchant: MerchantContext,
  includeInactive: boolean,
) {
  const plans = await configPlans(deps, merchant);
  return includeInactive ? plans : plans.filter((p) => p.active).map(forSale);
}

/** By id (`plan_…`) or key (`pro`). */
export async function getPlan(
  deps: AppDeps,
  merchant: MerchantContext,
  idOrKey: string,
): Promise<Plan> {
  const plans = await configPlans(deps, merchant);
  const plan = plans.find((p) => p.id === idOrKey || p.key === idOrKey);
  if (!plan) throw resourceMissing("plan", idOrKey);
  return plan;
}

export async function listFeatures(deps: AppDeps, merchant: MerchantContext) {
  return (await deps.catalog.load(scopeOf(merchant))).features;
}
