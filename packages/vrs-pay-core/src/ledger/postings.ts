import { invalidRequest } from "../errors";
import { money } from "../money/money";
import type { Money } from "../money/money.types";
import type { ProviderId } from "../providers/provider.types";
import type { LedgerEntry } from "./ledger.types";

/** Owner of the platform-fee account. */
export const PLATFORM_OWNER = "vrs_pay";

export interface CapturePostingInput {
  merchantId: string;
  provider: ProviderId;
  amount: Money;
  providerFee: Money;
  platformFee: Money;
}

/**
 * A captured payment: the provider owes us the gross amount, which splits
 * into the merchant's share, our application fee and the provider's fee.
 */
export function capturePosting(input: CapturePostingInput): LedgerEntry[] {
  const { amount, providerFee, platformFee, merchantId, provider } = input;
  if (providerFee.currency !== amount.currency || platformFee.currency !== amount.currency) {
    throw invalidRequest("currency_mismatch", "Fees must be in the payment currency.");
  }
  const net = amount.amount - providerFee.amount - platformFee.amount;
  if (net <= 0 || providerFee.amount < 0 || platformFee.amount < 0) {
    throw invalidRequest("fees_invalid", "Fees must be non-negative and less than the amount.");
  }
  const entries: LedgerEntry[] = [
    {
      account: { kind: "provider_receivable", owner: provider },
      direction: "debit",
      amount,
    },
    {
      account: { kind: "merchant_balance", owner: merchantId },
      direction: "credit",
      amount: money(net, amount.currency),
    },
  ];
  if (platformFee.amount > 0) {
    entries.push({
      account: { kind: "platform_fees", owner: PLATFORM_OWNER },
      direction: "credit",
      amount: platformFee,
    });
  }
  if (providerFee.amount > 0) {
    entries.push({
      account: { kind: "provider_fees", owner: provider },
      direction: "credit",
      amount: providerFee,
    });
  }
  return entries;
}

/** A refund comes out of the merchant's balance and back through the provider. */
export function refundPosting(input: {
  merchantId: string;
  provider: ProviderId;
  amount: Money;
}): LedgerEntry[] {
  return [
    {
      account: { kind: "merchant_balance", owner: input.merchantId },
      direction: "debit",
      amount: input.amount,
    },
    {
      account: { kind: "provider_receivable", owner: input.provider },
      direction: "credit",
      amount: input.amount,
    },
  ];
}
