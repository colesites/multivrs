import { invalidRequest, newId } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { CreatePaymentLinkInput } from "../routes/payment-link.schema";
import { amountIn } from "./billing-helpers";
import { nowSeconds } from "./events";
import type { PaymentLink, StoredPaymentLink } from "./payment-link.types";
import { findPrice } from "./price.service";

export const PAYMENT_LINK_METADATA_KEY = "vrs_payment_link";

export function publicLink(deps: AppDeps, { link }: StoredPaymentLink): PaymentLink {
  return { ...link, url: `${deps.urls.api}/l/${link.id}` };
}

/**
 * A price that's on sale, in `currency` (its own by default, or one of its
 * currency options), with its product's name as the description.
 */
export async function priceForSale(
  deps: AppDeps,
  merchant: MerchantContext,
  priceId: string,
  currency?: string,
) {
  const { plan, price } = await findPrice(deps, merchant, priceId);
  if (!plan.active || !price.active) {
    throw invalidRequest("price_inactive", "This price is no longer for sale.", "price");
  }
  const code = (currency ?? price.currency).toLowerCase();
  const amount = amountIn(price, code);
  if (amount === undefined) {
    throw invalidRequest(
      "currency_unavailable",
      `This price isn't sold in ${code.toUpperCase()}.`,
      "currency",
    );
  }
  return {
    plan,
    price: price.id,
    interval: price.interval,
    interval_count: price.interval_count,
    amount,
    currency: code,
    description: plan.name,
  };
}

export async function createPaymentLink(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreatePaymentLinkInput,
) {
  const sale = input.price
    ? await priceForSale(deps, merchant, input.price, input.currency)
    : { ...input, price: null, interval: "one_time" as const, interval_count: 1 };
  const { price, interval, interval_count, amount, currency, description } = sale;
  if (amount === undefined || currency === undefined || description === undefined) {
    throw invalidRequest(
      "parameter_missing",
      "Send a price, or an amount, currency and description.",
    );
  }
  const record: StoredPaymentLink = {
    merchantId: merchant.id,
    mode: merchant.mode,
    link: {
      id: newId("paymentLink"),
      object: "payment_link",
      livemode: merchant.mode === "live",
      price,
      interval,
      interval_count,
      amount,
      currency: currency.toLowerCase(),
      description,
      after_payment_url: input.after_payment_url ?? null,
      active: true,
      created: nowSeconds(),
    },
  };
  await deps.paymentLinks.create(record);
  return publicLink(deps, record);
}
