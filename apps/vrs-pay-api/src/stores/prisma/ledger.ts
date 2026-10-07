import { CurrencyCodeSchema, money } from "@vrs-pay/core";
import type { Db } from "../../db/client";
import { toMinor, toUnix } from "../../db/convert";
import type { LedgerStore } from "../ledger.store";

export function createPrismaLedgerStore(db: Db): LedgerStore {
  return {
    async entries(account, mode) {
      const rows = await db.ledgerEntry.findMany({
        where: { accountKind: account.kind, accountOwner: account.owner, mode },
        include: { transaction: { select: { createdAt: true } } },
      });
      return rows.map((row) => ({
        direction: row.direction === "debit" ? ("debit" as const) : ("credit" as const),
        amount: money(toMinor(row.amount), CurrencyCodeSchema.parse(row.currency)),
        at: toUnix(row.transaction.createdAt),
      }));
    },
  };
}
