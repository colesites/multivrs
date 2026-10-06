import { invalidRequest } from "../errors";
import { CURRENCY_EXPONENTS, type CurrencyCode } from "./currency";
import type { Money } from "./money.types";

const DECIMAL_PATTERN = /^(-?)(\d+)(?:\.(\d+))?$/;

export function money(amount: number, currency: CurrencyCode): Money {
  if (!Number.isSafeInteger(amount)) {
    throw invalidRequest(
      "amount_invalid",
      "Amounts must be whole numbers in the currency's minor unit.",
      "amount",
    );
  }
  return { amount, currency };
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw invalidRequest("currency_mismatch", `Cannot combine ${a.currency} and ${b.currency}.`);
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

/**
 * Parses a decimal string exactly ("49.99" GBP → 4999). Rejects more fraction
 * digits than the currency has instead of silently rounding.
 */
export function moneyFromDecimal(value: string, currency: CurrencyCode): Money {
  const match = DECIMAL_PATTERN.exec(value.trim());
  const exponent = CURRENCY_EXPONENTS[currency];
  const [, sign = "", whole = "", fraction = ""] = match ?? [];
  if (!match || fraction.length > exponent) {
    throw invalidRequest(
      "amount_invalid",
      `"${value}" is not a valid ${currency} amount.`,
      "amount",
    );
  }
  const minor = Number(`${whole}${fraction.padEnd(exponent, "0")}`);
  return money(sign === "-" ? -minor : minor, currency);
}

/** Exact decimal string for an amount (4999 GBP → "49.99"). */
export function moneyToDecimal({ amount, currency }: Money): string {
  const exponent = CURRENCY_EXPONENTS[currency];
  const digits = Math.abs(amount)
    .toString()
    .padStart(exponent + 1, "0");
  const whole = digits.slice(0, digits.length - exponent);
  const fraction = exponent > 0 ? `.${digits.slice(-exponent)}` : "";
  return `${amount < 0 ? "-" : ""}${whole}${fraction}`;
}

/** Display formatting only — never feed the result back into arithmetic. */
export function formatMoney(value: Money, locale = "en-GB"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: value.currency,
  }).format(Number(moneyToDecimal(value)));
}
