import { invalidRequest } from "../errors";
import { newId } from "../ids";
import type { CurrencyCode } from "../money/currency";
import type { LedgerAccount, LedgerBalances, LedgerEntry, LedgerTransaction } from "./ledger.types";

export function accountKey(account: LedgerAccount): string {
  return `${account.kind}:${account.owner}`;
}

function assertBalanced(entries: readonly LedgerEntry[]): void {
  if (entries.length < 2) {
    throw invalidRequest("ledger_unbalanced", "A transaction needs at least two entries.");
  }
  const net = new Map<CurrencyCode, number>();
  for (const { amount, direction } of entries) {
    if (!Number.isSafeInteger(amount.amount) || amount.amount <= 0) {
      throw invalidRequest(
        "ledger_amount_invalid",
        "Ledger entries must be positive whole minor units.",
      );
    }
    const signed = direction === "debit" ? amount.amount : -amount.amount;
    net.set(amount.currency, (net.get(amount.currency) ?? 0) + signed);
  }
  for (const [currency, total] of net) {
    if (total !== 0) {
      throw invalidRequest(
        "ledger_unbalanced",
        `Debits and credits differ by ${total} ${currency} minor units.`,
      );
    }
  }
}

/** Validates and stamps a transaction. Throws if it doesn't balance. */
export function createLedgerTransaction(input: {
  description: string;
  entries: readonly LedgerEntry[];
  occurredAt?: number;
}): LedgerTransaction {
  assertBalanced(input.entries);
  return {
    id: newId("ledgerTransaction"),
    description: input.description,
    occurredAt: input.occurredAt ?? Date.now(),
    entries: input.entries,
  };
}

/** Derives every account's balance from the transactions — never stored. */
export function computeBalances(transactions: Iterable<LedgerTransaction>): LedgerBalances {
  const balances: LedgerBalances = new Map();
  for (const transaction of transactions) {
    for (const { account, direction, amount } of transaction.entries) {
      const key = accountKey(account);
      const byCurrency = balances.get(key) ?? new Map<CurrencyCode, number>();
      const signed = direction === "debit" ? amount.amount : -amount.amount;
      byCurrency.set(amount.currency, (byCurrency.get(amount.currency) ?? 0) + signed);
      balances.set(key, byCurrency);
    }
  }
  return balances;
}

/** Debits minus credits — positive for assets like `provider_receivable`. */
export function debitBalance(
  balances: LedgerBalances,
  account: LedgerAccount,
  currency: CurrencyCode,
): number {
  return balances.get(accountKey(account))?.get(currency) ?? 0;
}

/** Credits minus debits — positive for what we owe, like `merchant_balance`. */
export function creditBalance(
  balances: LedgerBalances,
  account: LedgerAccount,
  currency: CurrencyCode,
): number {
  return -debitBalance(balances, account, currency);
}
