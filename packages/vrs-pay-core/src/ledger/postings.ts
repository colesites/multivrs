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

/**
 * A refund goes back through the provider. Its tax share comes out of the
 * tax we owe; the rest comes out of the merchant's balance.
 */
export function refundPosting(input: {
  merchantId: string;
  provider: ProviderId;
  amount: Money;
  /** The part of `amount` that was tax; zero when none. */
  tax?: Money;
}): LedgerEntry[] {
  const { amount } = input;
  const tax = input.tax ?? money(0, amount.currency);
  if (tax.currency !== amount.currency || tax.amount < 0 || tax.amount > amount.amount) {
    throw invalidRequest("tax_invalid", "Refunded tax must be within the refund amount.");
  }
  const entries: LedgerEntry[] = [
    {
      account: { kind: "merchant_balance", owner: input.merchantId },
      direction: "debit",
      amount: money(amount.amount - tax.amount, amount.currency),
    },
    { account: { kind: "tax_payable", owner: PLATFORM_OWNER }, direction: "debit", amount: tax },
    {
      account: { kind: "provider_receivable", owner: input.provider },
      direction: "credit",
      amount,
    },
  ];
  return entries.filter((e) => e.amount.amount > 0);
}

/**
 * A chargeback: the provider takes back the disputed amount and keeps its
 * dispute fee. The merchant's balance covers both, except the amount's tax
 * share, which comes off the tax we owe.
 */
export function disputePosting(input: {
  merchantId: string;
  provider: ProviderId;
  amount: Money;
  fee: Money;
  /** The part of `amount` that was tax; zero when none. */
  tax?: Money;
}): LedgerEntry[] {
  const { amount, fee } = input;
  const tax = input.tax ?? money(0, amount.currency);
  if (fee.currency !== amount.currency || tax.currency !== amount.currency) {
    throw invalidRequest("currency_mismatch", "Dispute amounts must share a currency.");
  }
  if (amount.amount < 0 || fee.amount < 0 || tax.amount < 0 || tax.amount > amount.amount) {
    throw invalidRequest(
      "dispute_invalid",
      "Dispute amounts must be non-negative, tax within the amount.",
    );
  }
  const entries: LedgerEntry[] = [
    {
      account: { kind: "merchant_balance", owner: input.merchantId },
      direction: "debit",
      amount: money(amount.amount - tax.amount + fee.amount, amount.currency),
    },
    { account: { kind: "tax_payable", owner: PLATFORM_OWNER }, direction: "debit", amount: tax },
    {
      account: { kind: "provider_receivable", owner: input.provider },
      direction: "credit",
      amount: money(amount.amount + fee.amount, amount.currency),
    },
  ];
  return entries.filter((e) => e.amount.amount > 0);
}

/** The same entries the other way round: money given back. */
export function reversePosting(entries: readonly LedgerEntry[]): LedgerEntry[] {
  return entries.map((e) => ({ ...e, direction: e.direction === "debit" ? "credit" : "debit" }));
}

/**
 * A payout: money leaves the provider balance for the merchant's bank. The
 * merchant's balance covers what's sent and the provider's transfer fee.
 * A failed payout is the same posting reversed.
 */
export function payoutPosting(input: {
  merchantId: string;
  provider: ProviderId;
  amount: Money;
  fee: Money;
}): LedgerEntry[] {
  const { amount, fee } = input;
  if (fee.currency !== amount.currency) {
    throw invalidRequest("currency_mismatch", "The payout fee must be in the payout currency.");
  }
  if (amount.amount <= 0 || fee.amount < 0) {
    throw invalidRequest(
      "payout_invalid",
      "A payout sends a positive amount with a non-negative fee.",
    );
  }
  const total = money(amount.amount + fee.amount, amount.currency);
  return [
    {
      account: { kind: "merchant_balance", owner: input.merchantId },
      direction: "debit",
      amount: total,
    },
    {
      account: { kind: "provider_receivable", owner: input.provider },
      direction: "credit",
      amount: total,
    },
  ];
}
