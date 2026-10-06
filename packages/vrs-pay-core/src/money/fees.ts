import { invalidRequest } from "../errors";
import { money } from "./money";
import type { Money } from "./money.types";

/** 10_000 basis points = 100%. */
export const BASIS_POINTS_PER_UNIT = 10_000;

/**
 * VRS Pay's application fee for a payment, from a rate in basis points
 * (150 bps = 1.5%) plus an optional fixed part in the same currency.
 * Rounds down so we never take more than the stated rate.
 */
export function calculatePlatformFee(amount: Money, rateBps: number, fixed?: Money): Money {
  if (!Number.isInteger(rateBps) || rateBps < 0 || rateBps > BASIS_POINTS_PER_UNIT) {
    throw invalidRequest(
      "fee_rate_invalid",
      "Fee rates are whole basis points between 0 and 10000.",
    );
  }
  if (fixed && fixed.currency !== amount.currency) {
    throw invalidRequest("currency_mismatch", "Fixed fees must be in the payment currency.");
  }
  const variable = Math.floor((amount.amount * rateBps) / BASIS_POINTS_PER_UNIT);
  return money(Math.min(amount.amount, variable + (fixed?.amount ?? 0)), amount.currency);
}
