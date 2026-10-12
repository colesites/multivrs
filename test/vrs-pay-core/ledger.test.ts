/**
 * @vrs-pay/core ledger — balanced double entry, derived balances.
 */
import { describe, expect, test } from "bun:test";
import {
  capturePosting,
  computeBalances,
  createLedgerTransaction,
  creditBalance,
  debitBalance,
  disputePosting,
  money,
  PLATFORM_OWNER,
  refundPosting,
  reversePosting,
} from "@vrs-pay/core";
import { thrown } from "./helpers";

const merchant = { kind: "merchant_balance", owner: "mer_test" } as const;
const stripeReceivable = { kind: "provider_receivable", owner: "stripe" } as const;
const platformFees = { kind: "platform_fees", owner: PLATFORM_OWNER } as const;

describe("ledger", () => {
  test("a capture splits gross into merchant share and fees", () => {
    const capture = createLedgerTransaction({
      description: "£100 payment",
      entries: capturePosting({
        merchantId: "mer_test",
        provider: "stripe",
        amount: money(10000, "GBP"),
        providerFee: money(290, "GBP"),
        platformFee: money(100, "GBP"),
      }),
    });
    const balances = computeBalances([capture]);
    expect(debitBalance(balances, stripeReceivable, "GBP")).toBe(10000);
    expect(creditBalance(balances, merchant, "GBP")).toBe(9610);
    expect(creditBalance(balances, platformFees, "GBP")).toBe(100);
    expect(capture.id).toMatch(/^ltx_/);
  });

  test("a refund comes out of the merchant balance", () => {
    const entries = refundPosting({
      merchantId: "mer_test",
      provider: "stripe",
      amount: money(2500, "GBP"),
    });
    const balances = computeBalances([createLedgerTransaction({ description: "refund", entries })]);
    expect(creditBalance(balances, merchant, "GBP")).toBe(-2500);
  });

  test("a refund's tax share comes out of tax owed, the rest from the merchant", () => {
    const entries = refundPosting({
      merchantId: "mer_test",
      provider: "stripe",
      amount: money(1200, "GBP"),
      tax: money(200, "GBP"),
    });
    const balances = computeBalances([createLedgerTransaction({ description: "refund", entries })]);
    const taxOwed = { kind: "tax_payable", owner: PLATFORM_OWNER } as const;
    expect(creditBalance(balances, merchant, "GBP")).toBe(-1000);
    expect(creditBalance(balances, taxOwed, "GBP")).toBe(-200);
    expect(creditBalance(balances, stripeReceivable, "GBP")).toBe(1200);
    expect(
      thrown(() =>
        refundPosting({
          merchantId: "mer_test",
          provider: "stripe",
          amount: money(100, "GBP"),
          tax: money(150, "GBP"),
        }),
      ).code,
    ).toBe("tax_invalid");
  });

  test("rejects unbalanced or non-positive entries", () => {
    const unbalanced = thrown(() =>
      createLedgerTransaction({
        description: "bad",
        entries: [
          { account: merchant, direction: "debit", amount: money(100, "GBP") },
          { account: stripeReceivable, direction: "credit", amount: money(99, "GBP") },
        ],
      }),
    );
    expect(unbalanced.code).toBe("ledger_unbalanced");
    const zero = thrown(() =>
      createLedgerTransaction({
        description: "zero",
        entries: [
          { account: merchant, direction: "debit", amount: money(0, "GBP") },
          { account: stripeReceivable, direction: "credit", amount: money(0, "GBP") },
        ],
      }),
    );
    expect(zero.code).toBe("ledger_amount_invalid");
  });

  test("balances each currency independently", () => {
    const entries = [
      { account: merchant, direction: "debit", amount: money(500, "GBP") },
      { account: stripeReceivable, direction: "credit", amount: money(500, "GBP") },
      { account: merchant, direction: "debit", amount: money(80000, "NGN") },
      { account: stripeReceivable, direction: "credit", amount: money(80000, "NGN") },
    ] as const;
    expect(createLedgerTransaction({ description: "multi", entries }).entries).toHaveLength(4);
  });

  test("fees must be valid and in the payment currency", () => {
    const base = {
      merchantId: "mer_test",
      provider: "paystack",
      amount: money(1000, "NGN"),
    } as const;
    const tooHigh = { ...base, providerFee: money(600, "NGN"), platformFee: money(400, "NGN") };
    expect(thrown(() => capturePosting(tooHigh)).code).toBe("fees_invalid");
    const wrongCurrency = { ...base, providerFee: money(10, "GBP"), platformFee: money(0, "NGN") };
    expect(thrown(() => capturePosting(wrongCurrency)).code).toBe("currency_mismatch");
  });
});

describe("disputePosting", () => {
  test("the merchant covers the amount and the fee; the tax share comes off the tax owed", () => {
    const entries = disputePosting({
      merchantId: "mer_test",
      provider: "stripe",
      amount: money(6000, "GBP"),
      fee: money(2000, "GBP"),
      tax: money(1000, "GBP"),
    });
    const balances = computeBalances([createLedgerTransaction({ description: "dp", entries })]);
    expect(debitBalance(balances, merchant, "GBP")).toBe(5000 + 2000);
    expect(debitBalance(balances, { kind: "tax_payable", owner: PLATFORM_OWNER }, "GBP")).toBe(
      1000,
    );
    expect(creditBalance(balances, stripeReceivable, "GBP")).toBe(8000);
  });

  test("reversed, it gives the same money back", () => {
    const taken = disputePosting({
      merchantId: "mer_test",
      provider: "stripe",
      amount: money(4900, "GBP"),
      fee: money(2000, "GBP"),
    });
    const balances = computeBalances([
      createLedgerTransaction({ description: "taken", entries: taken }),
      createLedgerTransaction({ description: "back", entries: reversePosting(taken) }),
    ]);
    expect(debitBalance(balances, merchant, "GBP")).toBe(0);
    expect(debitBalance(balances, stripeReceivable, "GBP")).toBe(0);
  });

  test("tax beyond the amount or mixed currencies are refused", () => {
    const base = { merchantId: "mer_test", provider: "stripe" as const };
    expect(
      thrown(() =>
        disputePosting({
          ...base,
          amount: money(100, "GBP"),
          fee: money(0, "GBP"),
          tax: money(200, "GBP"),
        }),
      ).code,
    ).toBe("dispute_invalid");
    expect(
      thrown(() => disputePosting({ ...base, amount: money(100, "GBP"), fee: money(20, "USD") }))
        .code,
    ).toBe("currency_mismatch");
  });
});
