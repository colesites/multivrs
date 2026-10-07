import { invalidRequest } from "../errors";
import { money } from "../money/money";
import type { Money } from "../money/money.types";
import type { ProviderId } from "../providers/provider.types";
import type { LedgerEntry } from "./ledger.types";
import { PLATFORM_OWNER } from "./postings";

export interface SalePostingInput {
  merchantId: string;
  provider: ProviderId;
  amount: Money;
  /** What the provider charged us for processing. */
  providerFee: Money;
  /** VRS Pay's fee. */
  platformFee: Money;
  /** Tax collected for remittance; zero when none applies. */
  tax?: Money;
}

/**
 * A payment charged on the platform account. The provider settles the
 * amount less its fee (our processing cost); the merchant is owed the
 * amount less our fee and any tax; we keep the fee and owe the tax.
 */
export function salePosting(input: SalePostingInput): LedgerEntry[] {
  const { amount, providerFee, platformFee, merchantId, provider } = input;
  const tax = input.tax ?? money(0, amount.currency);
  const currencies = [providerFee, platformFee, tax].map((m) => m.currency);
  if (currencies.some((c) => c !== amount.currency)) {
    throw invalidRequest("currency_mismatch", "Fees and tax must be in the payment currency.");
  }
  const owed = amount.amount - platformFee.amount - tax.amount;
  const settled = amount.amount - providerFee.amount;
  if (owed < 0 || settled < 0 || [providerFee, platformFee, tax].some((m) => m.amount < 0)) {
    throw invalidRequest(
      "fees_invalid",
      "Fees and tax must be non-negative and within the amount.",
    );
  }
  const entries: LedgerEntry[] = [
    {
      account: { kind: "provider_receivable", owner: provider },
      direction: "debit",
      amount: money(settled, amount.currency),
    },
    {
      account: { kind: "provider_fees", owner: provider },
      direction: "debit",
      amount: providerFee,
    },
    {
      account: { kind: "merchant_balance", owner: merchantId },
      direction: "credit",
      amount: money(owed, amount.currency),
    },
    {
      account: { kind: "platform_fees", owner: PLATFORM_OWNER },
      direction: "credit",
      amount: platformFee,
    },
    { account: { kind: "tax_payable", owner: PLATFORM_OWNER }, direction: "credit", amount: tax },
  ];
  // Zero lines add nothing; the ledger only records positive amounts.
  return entries.filter((e) => e.amount.amount > 0);
}
