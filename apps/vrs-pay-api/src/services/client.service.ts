import { invalidRequest, resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { StoredCustomer } from "./customer.types";
import { entitlementsFor } from "./entitlements.service";
import { listProducts } from "./product.service";
import type { Product } from "./product.types";
import { loadSubscription, scopeOf } from "./subscription.service";

/** What a pricing table shows: no metadata, internal labels or archived prices. */
function publicProduct(product: Product) {
  const { id, name, description, images, marketing_features, trial_days, features } = product;
  const prices = product.prices
    .filter((p) => p.active)
    .map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      currency_options: p.currency_options,
      interval: p.interval,
      interval_count: p.interval_count,
      usage_type: p.usage_type,
      lookup_key: p.lookup_key,
    }));
  return {
    id,
    object: "product" as const,
    name,
    description,
    images,
    marketing_features,
    trial_days,
    features,
    prices,
  };
}

/** `GET /client/v1/pricing`: active products and their active prices. */
export async function pricing(deps: AppDeps, merchant: MerchantContext) {
  const products = await listProducts(deps, merchant, true);
  return {
    object: "list" as const,
    data: products.map(publicProduct).filter((p) => p.prices.length > 0),
  };
}

/** The signed-in customer, or a clear error for pages that need one. */
export function requireCustomer(customer: StoredCustomer | null): StoredCustomer {
  if (!customer) {
    throw invalidRequest(
      "customer_session_required",
      "Send a customer session secret in VRS-Customer-Session for this.",
    );
  }
  return customer;
}

/** `GET /client/v1/customer`: what a customer portal shows. */
export async function customerOverview(
  deps: AppDeps,
  merchant: MerchantContext,
  stored: StoredCustomer,
) {
  const scope = scopeOf(merchant);
  const { id, email, name } = stored.customer;
  const [subscriptions, invoices, entitlements, products] = await Promise.all([
    deps.billing.listSubscriptions(scope, id),
    deps.billing.listInvoices(scope, { customerId: id }),
    entitlementsFor(deps, scope, id),
    listProducts(deps, merchant),
  ]);
  const productOf = (planId: string) => products.find((p) => p.id === planId);
  return {
    object: "customer_overview" as const,
    customer: { id, email, name },
    subscriptions: subscriptions
      .map((s) => s.subscription)
      .filter((s) => s.status !== "incomplete")
      .map((s) => ({
        ...s,
        product_name: productOf(s.plan)?.name ?? null,
        price_details: productOf(s.plan)?.prices.find((p) => p.id === s.price) ?? null,
      })),
    invoices: invoices.slice(0, 12).map((i) => i.invoice),
    entitlements,
  };
}

/** A subscription the signed-in customer owns; anyone else's is "not found". */
export async function ownSubscription(
  deps: AppDeps,
  merchant: MerchantContext,
  stored: StoredCustomer,
  id: string,
) {
  const sub = await loadSubscription(deps, merchant, id).catch(() => null);
  if (!sub || sub.subscription.customer !== stored.customer.id) {
    throw resourceMissing("subscription", id);
  }
  return sub;
}
