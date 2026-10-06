import type { CurrencyCode } from "./currency";

/**
 * An amount of money. `amount` is an integer in the currency's minor unit
 * (pence, kobo, cents) — never a float.
 */
export interface Money {
  readonly amount: number;
  readonly currency: CurrencyCode;
}
