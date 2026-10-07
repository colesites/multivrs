import type { LedgerStore } from "../ledger.store";
import type { MemoryState } from "./state";

export function createMemoryLedgerStore(state: MemoryState): LedgerStore {
  return {
    async entries(account, mode) {
      return state.ledger
        .filter((p) => p.mode === mode)
        .flatMap(({ transaction }) =>
          transaction.entries
            .filter((e) => e.account.kind === account.kind && e.account.owner === account.owner)
            .map((e) => ({
              direction: e.direction,
              amount: e.amount,
              at: Math.floor(transaction.occurredAt / 1000),
            })),
        );
    },
  };
}
