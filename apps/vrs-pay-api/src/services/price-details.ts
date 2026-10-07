import { CurrencyCodeSchema, invalidRequest, money } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { PriceDataInput } from "../routes/product.schema";
import type { CurrencyOption, Plan, PriceDetails, PriceLabels } from "./catalog.types";
import { assertMinimumAmount, chargeableCurrencies } from "./platform";

/** Lowercase codes, each one VRS Pay can charge, none repeating the price's own currency. */
function currencyOptions(deps: AppDeps, input: PriceDataInput): Record<string, CurrencyOption> {
  const main = input.currency.toLowerCase();
  const options: Record<string, CurrencyOption> = {};
  for (const [code, { amount }] of Object.entries(input.currency_options)) {
    const currency = CurrencyCodeSchema.parse(code);
    const param = `currency_options.${code}`;
    if (currency.toLowerCase() === main) {
      throw invalidRequest(
        "currency_option_duplicate",
        `${currency} is the price's own currency.`,
        param,
      );
    }
    if (!chargeableCurrencies(deps).includes(currency)) {
      throw invalidRequest(
        "currency_unsupported",
        `VRS Pay can't take payments in ${currency} yet.`,
        param,
      );
    }
    options[currency.toLowerCase()] = { amount };
  }
  return options;
}

/** Fixed prices are charged as they are, so each currency's amount must cover the fees. Metered unit prices can be tiny. */
function assertChargeableAmounts(input: PriceDataInput) {
  if (input.usage_type === "metered") return;
  assertMinimumAmount(money(input.amount, input.currency));
  for (const [code, { amount }] of Object.entries(input.currency_options)) {
    assertMinimumAmount(money(amount, CurrencyCodeSchema.parse(code)), `currency_options.${code}`);
  }
}

/** A new price's currency options, nickname and lookup key, checked. */
export function priceDetails(deps: AppDeps, input: PriceDataInput): PriceDetails {
  assertChargeableAmounts(input);
  return {
    currency_options: currencyOptions(deps, input),
    nickname: input.nickname ?? null,
    lookup_key: input.lookup_key ?? null,
    usage_type: input.usage_type,
    aggregate_usage: input.usage_type === "metered" ? (input.aggregate_usage ?? "sum") : null,
  };
}

/**
 * What to write so `key` can belong to price `priceId`: nothing when no
 * other price has it, or that price losing it when `transfer` is set, as
 * on Stripe. Otherwise the key is taken.
 */
export function claimLookupKey(
  plans: readonly Plan[],
  key: string | null,
  priceId: string | null,
  transfer: boolean,
): PriceLabels[] {
  if (key === null) return [];
  const holder = plans
    .flatMap((p) => p.prices)
    .find((p) => p.lookup_key === key && p.id !== priceId);
  if (!holder) return [];
  if (!transfer) {
    throw invalidRequest(
      "lookup_key_taken",
      `Another price has the lookup key ${key}. Send transfer_lookup_key to move it here.`,
      "lookup_key",
    );
  }
  return [{ id: holder.id, nickname: holder.nickname, lookup_key: null }];
}
