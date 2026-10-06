import { z } from "zod";

/** ISO 4217 currencies VRS Pay prices in. Extend as markets open. */
export const CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "INR",
  "BRL",
  "NGN",
  "GHS",
  "KES",
  "ZAR",
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

/** Digits after the decimal point: 4999 minor units of GBP is £49.99; JPY has none. */
export const CURRENCY_EXPONENTS: Record<CurrencyCode, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  CAD: 2,
  AUD: 2,
  JPY: 0,
  INR: 2,
  BRL: 2,
  NGN: 2,
  GHS: 2,
  KES: 2,
  ZAR: 2,
};

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_CODES.some((code) => code === value);
}

/** Accepts `"gbp"` or `"GBP"` (APIs conventionally use lowercase). */
export const CurrencyCodeSchema = z
  .string()
  .transform((value) => value.toUpperCase())
  .pipe(z.enum(CURRENCY_CODES));
