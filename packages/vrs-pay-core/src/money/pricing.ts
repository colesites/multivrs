import type { CurrencyCode } from "./currency";
import { calculatePlatformFee } from "./fees";
import { money } from "./money";
import type { Money } from "./money.types";

/** The fixed part of VRS Pay's fee per currency, in minor units (about US$0.50 each). */
export const FIXED_FEE_MINOR: Record<CurrencyCode, number> = {
  USD: 50,
  EUR: 50,
  GBP: 40,
  CAD: 70,
  AUD: 80,
  JPY: 80,
  INR: 4_000,
  BRL: 250,
  NGN: 75_000,
  GHS: 600,
  KES: 6_500,
  ZAR: 900,
};

/** Default rate for new merchants, in basis points (500 = 5%). */
export const DEFAULT_FEE_BPS = 500;

/** VRS Pay's fee on a payment: the merchant's rate plus the currency's fixed part. */
export function platformFee(amount: Money, rateBps: number): Money {
  return calculatePlatformFee(
    amount,
    rateBps,
    money(FIXED_FEE_MINOR[amount.currency], amount.currency),
  );
}
