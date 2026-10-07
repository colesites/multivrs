import type { ApiKeyMode, LedgerAccount, Money } from "@vrs-pay/core";

export interface AccountEntry {
  direction: "debit" | "credit";
  amount: Money;
  /** Unix seconds the posting was made. */
  at: number;
}

/** Reads the ledger account by account. */
export interface LedgerStore {
  entries(account: LedgerAccount, mode: ApiKeyMode): Promise<AccountEntry[]>;
}
