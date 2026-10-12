import { isVrsPayError, type Money, money } from "@vrs-pay/core";
import type { PaystackApi } from "./paystack-api";

/** A bank Paystack can pay into. */
export interface PayoutBank {
  name: string;
  code: string;
}

export interface PayoutRecipient {
  name: string;
  accountNumber: string;
  bankCode: string;
}

export type PayoutSendStatus = "pending" | "paid" | "failed";

/** Sends merchants their money: one provider's transfers. */
export interface PayoutRail {
  /** What the provider charges to send `amount`. */
  fee(amount: Money): Money;
  send(input: {
    reference: string;
    amount: Money;
    recipient: PayoutRecipient;
    reason: string;
  }): Promise<{
    status: PayoutSendStatus;
    /** What the merchant sees. */
    failureMessage: string | null;
    /** The provider's own words, for our logs. */
    detail?: string;
  }>;
  /** Asks how a transfer ended, for ones whose answer never arrived. */
  verify(reference: string): Promise<{ status: PayoutSendStatus; failureMessage: string | null }>;
  banks(): Promise<PayoutBank[]>;
  /** The account holder's name, as the bank has it. */
  resolveAccount(accountNumber: string, bankCode: string): Promise<{ accountName: string }>;
}

const KOBO = 100;
/** Paystack's NGN transfer fee bands, then the ₦50 stamp duty on transfers of ₦10,000 or more. */
export function paystackTransferFee(amount: Money): Money {
  const naira = amount.amount / KOBO;
  const fee = naira <= 5_000 ? 10 : naira <= 50_000 ? 25 : 50;
  const stampDuty = naira >= 10_000 ? 50 : 0;
  return money((fee + stampDuty) * KOBO, amount.currency);
}

/** Paystack transfer statuses → ours. "otp" waits on a code no one will send. */
function statusFrom(status: string): PayoutSendStatus {
  if (status === "success") return "paid";
  if (
    status === "failed" ||
    status === "reversed" ||
    status === "abandoned" ||
    status === "rejected"
  ) {
    return "failed";
  }
  return "pending";
}

/** Problems with VRS Pay's own Paystack account, not the merchant's: they mustn't see Paystack's wording. */
const PLATFORM_PROBLEM =
  "VRS Pay couldn't send this payout yet; the problem is on our side. The money is back in your balance and the next payout tries again.";
const PLATFORM_ERRORS = /starter business|insufficient|balance is not enough|otp/i;
const BANK_CACHE_MS = 24 * 60 * 60 * 1000;

type BankRow = { name: string; code: string; active?: boolean };

interface Transfer {
  status: string;
  reference: string;
  reason?: string | null;
  failures?: unknown;
}

/** Paystack Transfers from the platform's NGN balance to Nigerian bank accounts. */
export function createPaystackPayouts(api: PaystackApi): PayoutRail {
  let banks: { at: number; list: PayoutBank[] } | null = null;
  const outcome = (transfer: Transfer) => {
    if (transfer.status === "otp") {
      return {
        status: "failed" as const,
        failureMessage: PLATFORM_PROBLEM,
        detail: "Paystack asked for an OTP: turn off OTP for transfers in Paystack.",
      };
    }
    const status = statusFrom(transfer.status);
    return {
      status,
      failureMessage: status === "failed" ? `Paystack says the transfer ${transfer.status}.` : null,
    };
  };
  return {
    fee: paystackTransferFee,
    async send({ reference, amount, recipient, reason }) {
      try {
        const { recipient_code } = await api.request<{ recipient_code: string }>(
          "POST",
          "/transferrecipient",
          {
            type: "nuban",
            name: recipient.name,
            account_number: recipient.accountNumber,
            bank_code: recipient.bankCode,
            currency: amount.currency,
          },
        );
        const transfer = await api.request<Transfer>("POST", "/transfer", {
          source: "balance",
          amount: amount.amount,
          currency: amount.currency,
          recipient: recipient_code,
          reference,
          reason,
        });
        return outcome(transfer);
      } catch (error) {
        const retryable =
          isVrsPayError(error) &&
          (error.details as { retryable?: boolean } | undefined)?.retryable === true;
        // No answer: the transfer may exist, so wait for its webhook or a verify.
        if (retryable) return { status: "pending", failureMessage: null };
        const detail = error instanceof Error ? error.message : "The transfer failed.";
        if (PLATFORM_ERRORS.test(detail)) {
          return { status: "failed", failureMessage: PLATFORM_PROBLEM, detail };
        }
        return {
          status: "failed",
          failureMessage: `The bank didn't accept the transfer (${detail.replace(/^paystack \S+ failed: /, "")}). Check your payout account.`,
          detail,
        };
      }
    },
    async verify(reference) {
      const transfer = await api.request<Transfer>(
        "GET",
        `/transfer/verify/${encodeURIComponent(reference)}`,
      );
      return outcome(transfer);
    },
    async banks() {
      if (banks && Date.now() - banks.at < BANK_CACHE_MS) return banks.list;
      const list: PayoutBank[] = [];
      let next: string | null = null;
      do {
        const cursor: string = next ? `&next=${encodeURIComponent(next)}` : "";
        const page: { data: BankRow[]; next: string | null } = await api.page<BankRow>(
          `/bank?country=nigeria&currency=NGN&perPage=100&use_cursor=true${cursor}`,
        );
        for (const bank of page.data) {
          if (bank.active !== false) list.push({ name: bank.name, code: bank.code });
        }
        next = page.next;
      } while (next);
      list.sort((a, b) => a.name.localeCompare(b.name));
      banks = { at: Date.now(), list };
      return list;
    },
    async resolveAccount(accountNumber, bankCode) {
      const found = await api.request<{ account_name: string }>(
        "GET",
        `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
      );
      return { accountName: found.account_name };
    },
  };
}
