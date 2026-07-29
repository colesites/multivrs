import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type Stripe from "stripe";
import { z } from "zod";
import { getStripe } from "@/lib/payments/stripe-client";

const PRICE_FORMATTERS = new Map<string, Intl.NumberFormat>();

const priceConfigSchema = z
  .object({
    priceId: z.string().trim().min(1).optional(),
    lookupKey: z.string().trim().min(1).optional(),
  })
  .refine((value) => value.priceId || value.lookupKey);

export type StripePlan = {
  configured: boolean;
  description: string;
  features: string[];
  name: string;
  priceId: string | null;
  priceLabel: string;
  priceSuffix: string;
};

function unavailablePlan(name: string): StripePlan {
  return {
    configured: false,
    description: "This plan is temporarily unavailable.",
    features: [],
    name,
    priceId: null,
    priceLabel: "Unavailable",
    priceSuffix: "",
  };
}

function productFrom(price: Stripe.Price): Stripe.Product | null {
  return typeof price.product === "object" &&
    !("deleted" in price.product && price.product.deleted)
    ? price.product
    : null;
}

function formatAmount(price: Stripe.Price): string | null {
  if (price.unit_amount === null) return null;
  const maximumFractionDigits = price.unit_amount % 100 === 0 ? 0 : 2;
  const key = `${price.currency}:${maximumFractionDigits}`;
  let formatter = PRICE_FORMATTERS.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en", {
      style: "currency",
      currency: price.currency,
      maximumFractionDigits,
    });
    PRICE_FORMATTERS.set(key, formatter);
  }
  return formatter.format(price.unit_amount / 100);
}

async function resolvePrice(
  config: z.infer<typeof priceConfigSchema>,
): Promise<Stripe.Price> {
  const stripe = getStripe();
  if (config.priceId) {
    return stripe.prices.retrieve(config.priceId, {
      expand: ["product"],
    });
  }
  const prices = await stripe.prices.list({
    active: true,
    expand: ["data.product"],
    limit: 1,
    lookup_keys: [config.lookupKey as string],
  });
  const price = prices.data[0];
  if (!price) throw new Error("No active Stripe price matched the lookup key");
  return price;
}

async function getStripePlan(
  name: string,
  lookupKeyName:
    | "STRIPE_FREE_MONTHLY_LOOKUP_KEY"
    | "STRIPE_PRO_MONTHLY_LOOKUP_KEY",
  priceIdName: "STRIPE_FREE_MONTHLY_PRICE_ID" | "STRIPE_PRO_MONTHLY_PRICE_ID",
): Promise<StripePlan> {
  const config = priceConfigSchema.safeParse({
    priceId: process.env[priceIdName] || undefined,
    lookupKey: process.env[lookupKeyName] || undefined,
  });
  if (!config.success) return unavailablePlan(name);

  try {
    const price = await resolvePrice(config.data);
    const amount = formatAmount(price);
    if (!amount || !price.active) return unavailablePlan(name);
    const product = productFrom(price);
    if (!product?.active) return unavailablePlan(name);
    return {
      configured: true,
      description: product.description?.trim() || "",
      features:
        product.marketing_features
          ?.map((feature) => feature.name?.trim())
          .filter((name): name is string => Boolean(name)) ?? [],
      name: product.name,
      priceId: price.id,
      priceLabel: amount,
      priceSuffix: price.recurring
        ? `/${price.recurring.interval === "month" ? "mo." : price.recurring.interval}`
        : "",
    };
  } catch {
    return unavailablePlan(name);
  }
}

export function getProPlan(): Promise<StripePlan> {
  return getStripePlan(
    "Pro",
    "STRIPE_PRO_MONTHLY_LOOKUP_KEY",
    "STRIPE_PRO_MONTHLY_PRICE_ID",
  );
}

export async function getPricingPlans(): Promise<{
  freePlan: StripePlan;
  proPlan: StripePlan;
}> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag("pricing");

  const [freePlan, proPlan] = await Promise.all([
    getStripePlan(
      "Hobby",
      "STRIPE_FREE_MONTHLY_LOOKUP_KEY",
      "STRIPE_FREE_MONTHLY_PRICE_ID",
    ),
    getProPlan(),
  ]);
  return { freePlan, proPlan };
}
