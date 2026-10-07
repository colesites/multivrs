import type { AppDeps, MerchantContext } from "../app.types";

/** Days a sale is held before it can be paid out (covers refunds and chargebacks). */
export const HOLD_DAYS = 7;
const DAY = 86_400;

export interface CurrencyBalance {
  currency: string;
  /** Ready to pay out. */
  available: number;
  /** From sales in the last HOLD_DAYS days. */
  pending: number;
}

/** What VRS Pay owes the merchant, per currency, from their ledger account. */
export async function merchantBalance(deps: AppDeps, merchant: MerchantContext) {
  const entries = await deps.ledger.entries(
    { kind: "merchant_balance", owner: merchant.id },
    merchant.mode,
  );
  const holdFrom = Math.floor(Date.now() / 1000) - HOLD_DAYS * DAY;
  const totals = new Map<string, CurrencyBalance>();
  for (const { direction, amount, at } of entries) {
    const currency = amount.currency.toLowerCase();
    const t = totals.get(currency) ?? { currency, available: 0, pending: 0 };
    const signed = direction === "credit" ? amount.amount : -amount.amount;
    if (direction === "credit" && at >= holdFrom) t.pending += signed;
    else t.available += signed;
    totals.set(currency, t);
  }
  return { object: "balance" as const, hold_days: HOLD_DAYS, data: [...totals.values()] };
}
