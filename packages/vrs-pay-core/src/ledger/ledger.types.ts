import type { CurrencyCode } from "../money/currency";
import type { Money } from "../money/money.types";

export const LEDGER_ACCOUNT_KINDS = [
  /** Money a provider holds or owes for captured payments. */
  "provider_receivable",
  /** What we owe a merchant (paid out by the provider). */
  "merchant_balance",
  /** VRS Pay's application fees. */
  "platform_fees",
  /** Processing fees charged by the provider. */
  "provider_fees",
] as const;

export type LedgerAccountKind = (typeof LEDGER_ACCOUNT_KINDS)[number];

/** e.g. `{ kind: "merchant_balance", owner: "mer_…" }` or `{ kind: "provider_receivable", owner: "stripe" }`. */
export interface LedgerAccount {
  kind: LedgerAccountKind;
  owner: string;
}

export type EntryDirection = "debit" | "credit";

/** One side of a posting. `amount.amount` is always positive. */
export interface LedgerEntry {
  account: LedgerAccount;
  direction: EntryDirection;
  amount: Money;
}

/** Append-only and balanced per currency: total debits equal total credits. */
export interface LedgerTransaction {
  id: string;
  description: string;
  occurredAt: number;
  entries: readonly LedgerEntry[];
}

/** account key → currency → debits minus credits. */
export type LedgerBalances = Map<string, Map<CurrencyCode, number>>;
