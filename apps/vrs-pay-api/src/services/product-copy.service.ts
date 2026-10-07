import { invalidRequest } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import { CreateProductSchema } from "../routes/product.schema";
import { createProduct, editable, findPlan } from "./product.service";
import type { Product } from "./product.types";

/**
 * Stripe's "Copy to live mode": a test product and its active prices made
 * again in live mode, with new ids. Dashboard only, since an API key only
 * reaches its own mode. Lookup keys come along, so one taken in live
 * mode stops the copy.
 */
export async function copyProductToLive(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
): Promise<Product> {
  if (merchant.mode !== "test") {
    throw invalidRequest("mode_invalid", "Open the product in test mode to copy it to live.");
  }
  const plan = editable(await findPlan(deps, merchant, id));
  const prices = plan.prices.filter((p) => p.active);
  if (prices.length === 0) {
    throw invalidRequest("product_has_no_prices", "Add a price before copying this product.");
  }
  const input = CreateProductSchema.parse({
    name: plan.name,
    description: plan.description ?? undefined,
    prices: prices.map((p) => ({
      amount: p.amount,
      currency: p.currency,
      interval: p.interval,
      interval_count: p.interval_count,
      currency_options: p.currency_options,
      nickname: p.nickname ?? undefined,
      lookup_key: p.lookup_key ?? undefined,
    })),
    trial_days: plan.trial_days,
    features: plan.features,
    images: plan.images,
    marketing_features: plan.marketing_features,
    metadata: plan.metadata,
  });
  return createProduct(deps, { ...merchant, mode: "live" }, input);
}
