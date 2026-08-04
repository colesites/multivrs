import "server-only";
import { ConflictError } from "@multivrs/error-utils";
import type Stripe from "stripe";
import { getStripe } from "@/lib/payments/stripe-client";

export const BILLING_PRODUCT_KEYS = [
  "pro_plan",
  "enterprise_plan",
  "developer_seat",
  "speed_insights",
  "web_analytics_plus",
  "observability_plus",
  "mail_volume",
  "mail_email_units",
  "usage_overage_cents",
] as const;
export type BillingProductKey = (typeof BILLING_PRODUCT_KEYS)[number];
export type BillingItemKind = "plan" | "addon" | "meter";

type ProductDefinition = {
  kind: BillingItemKind;
  lookupKey: string;
  priceIdEnvironment: string;
};

export const BILLING_PRODUCTS: Record<BillingProductKey, ProductDefinition> = {
  developer_seat: product(
    "addon",
    "multivrs_developer_seat_monthly",
    "STRIPE_DEVELOPER_SEAT_PRICE_ID",
  ),
  enterprise_plan: product(
    "plan",
    "multivrs_enterprise_monthly",
    "STRIPE_ENTERPRISE_MONTHLY_PRICE_ID",
  ),
  mail_email_units: product(
    "meter",
    "multivrs_mail_email_units",
    "STRIPE_MAIL_EMAIL_UNITS_PRICE_ID",
  ),
  mail_volume: product(
    "addon",
    "multivrs_mail_volume_monthly",
    "STRIPE_MAIL_VOLUME_PRICE_ID",
  ),
  observability_plus: product(
    "addon",
    "multivrs_observability_plus_monthly",
    "STRIPE_OBSERVABILITY_PLUS_PRICE_ID",
  ),
  pro_plan: product(
    "plan",
    "multivrs_pro_monthly",
    "STRIPE_PRO_MONTHLY_PRICE_ID",
  ),
  speed_insights: product(
    "addon",
    "multivrs_speed_insights_monthly",
    "STRIPE_SPEED_INSIGHTS_PRICE_ID",
  ),
  usage_overage_cents: product(
    "meter",
    "multivrs_usage_overage_cents",
    "STRIPE_USAGE_OVERAGE_CENTS_PRICE_ID",
  ),
  web_analytics_plus: product(
    "addon",
    "multivrs_web_analytics_plus_monthly",
    "STRIPE_WEB_ANALYTICS_PLUS_PRICE_ID",
  ),
};

export async function resolveCatalogPrice(
  key: BillingProductKey,
): Promise<Stripe.Price> {
  const definition = BILLING_PRODUCTS[key];
  const priceId = process.env[definition.priceIdEnvironment]?.trim();
  if (priceId)
    return getStripe().prices.retrieve(priceId, { expand: ["product"] });
  const lookupKey =
    key === "pro_plan"
      ? process.env.STRIPE_PRO_MONTHLY_LOOKUP_KEY?.trim() ||
        definition.lookupKey
      : definition.lookupKey;
  const prices = await getStripe().prices.list({
    active: true,
    expand: ["data.product"],
    limit: 1,
    lookup_keys: [lookupKey],
  });
  const price = prices.data[0];
  if (!price)
    throw new ConflictError(`Stripe price ${lookupKey} is not configured`);
  return price;
}

export function identifyBillingProduct(price: Stripe.Price): {
  key: BillingProductKey | "unknown";
  kind: BillingItemKind | "unknown";
} {
  const metadataKey = price.metadata.multivrs_product_key;
  const key = BILLING_PRODUCT_KEYS.find((candidate) => {
    const definition = BILLING_PRODUCTS[candidate];
    const configuredId = process.env[definition.priceIdEnvironment]?.trim();
    const configuredLookup =
      candidate === "pro_plan"
        ? process.env.STRIPE_PRO_MONTHLY_LOOKUP_KEY?.trim()
        : undefined;
    return (
      metadataKey === candidate ||
      price.id === configuredId ||
      price.lookup_key === (configuredLookup || definition.lookupKey)
    );
  });
  return key
    ? { key, kind: BILLING_PRODUCTS[key].kind }
    : { key: "unknown", kind: "unknown" };
}

function product(
  kind: BillingItemKind,
  lookupKey: string,
  priceIdEnvironment: string,
): ProductDefinition {
  return { kind, lookupKey, priceIdEnvironment };
}
