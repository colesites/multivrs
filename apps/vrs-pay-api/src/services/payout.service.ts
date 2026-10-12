import {
  type ApiKeyMode,
  type CurrencyCode,
  CurrencyCodeSchema,
  createLedgerTransaction,
  formatMoney,
  invalidRequest,
  type Money,
  money,
  newId,
  type PayoutUpdatedData,
  type ProviderId,
  payoutPosting,
  reversePosting,
} from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { PayoutRail } from "../providers/paystack/paystack-payouts";
import { merchantBalance } from "./balance.service";
import type { EventOutcome } from "./capture.service";
import type { Effects } from "./event.types";
import { buildEvent } from "./events";
import type { OnboardingRecord } from "./onboarding.types";
import type { PayoutUpdate, StoredPayout } from "./payout.types";
import { accountSetup } from "./setup.service";

/** The least a payout sends, so a transfer fee never eats most of it. Minor units. */
export const MIN_PAYOUT: Partial<Record<CurrencyCode, number>> = {
  NGN: 500_000,
  GBP: 1_000,
  USD: 1_000,
  EUR: 1_000,
};
const DEFAULT_MIN_PAYOUT = 1_000;
/** Payouts with no answer from the provider after this long are checked. */
const CHECK_AFTER_SECONDS = 60 * 60;
const MODES: readonly ApiKeyMode[] = ["test", "live"];

/** "₦5,000.00" rather than "NGN 5,000.00". */
const shown = (value: Money) => formatMoney(value, value.currency === "NGN" ? "en-NG" : "en-GB");

export function minimumPayout(currency: CurrencyCode): number {
  return MIN_PAYOUT[currency] ?? DEFAULT_MIN_PAYOUT;
}

interface PayoutAccount {
  currency: CurrencyCode;
  name: string;
  bankName: string | null;
  last4: string | null;
  accountNumber: string;
  bankCode: string | null;
}

async function payoutAccount(
  deps: AppDeps,
  record: OnboardingRecord,
): Promise<PayoutAccount | null> {
  if (!record.payoutDetails || !deps.sealer) return null;
  const currency = CurrencyCodeSchema.safeParse(record.payoutCurrency ?? "");
  if (!currency.success) return null;
  const details = JSON.parse(await deps.sealer.open(record.payoutDetails)) as {
    accountNumber: string;
    bankCode: string | null;
  };
  return {
    currency: currency.data,
    name: record.payoutAccountName ?? "",
    bankName: record.payoutBankName,
    last4: record.payoutLast4,
    accountNumber: details.accountNumber,
    bankCode: details.bankCode,
  };
}

export type PayoutRoute = { id: ProviderId; rail: PayoutRail } | { reason: string };

/** Who can pay out this currency in this mode, or why no one can yet. */
export function payoutRouteFor(
  deps: AppDeps,
  mode: ApiKeyMode,
  currency: string,
  bankCode: string | null = "known",
): PayoutRoute {
  if (currency.toUpperCase() === "NGN") {
    const rail = deps.modes[mode].payoutRails?.paystack;
    if (!rail) return { reason: "Naira payouts aren't set up on this server yet." };
    if (!bankCode) return { reason: "Choose your bank again in Account setup → Payout." };
    return { id: "paystack", rail };
  }
  return {
    reason: `Payouts in ${currency.toUpperCase()} start once Stripe Global Payouts is switched on for VRS Pay.`,
  };
}

/**
 * What to send out of `available`: everything less the transfer fee, with
 * the fee for the band the sent amount lands in.
 */
export function payoutAmounts(
  rail: PayoutRail,
  available: Money,
): { amount: Money; fee: Money } | null {
  let fee = rail.fee(available);
  for (let step = 0; step < 3; step++) {
    const amount = money(available.amount - fee.amount, available.currency);
    if (amount.amount <= 0) return null;
    const actual = rail.fee(amount);
    if (actual.amount === fee.amount) return { amount, fee };
    fee = actual;
  }
  // Right on a band edge: send at the higher fee.
  const higher = rail.fee(available);
  const amount = money(available.amount - higher.amount, available.currency);
  return amount.amount > 0 ? { amount, fee: higher } : null;
}

/** Paid: tell the merchant. Failed: the money goes back to their balance, and tell them. */
function settleEffects(stored: StoredPayout): Effects {
  const { merchantId, mode, payout } = stored;
  if (payout.status === "paid")
    return { event: buildEvent(merchantId, mode, "payout.paid", payout) };
  const currency = CurrencyCodeSchema.parse(payout.currency);
  return {
    ledger: {
      mode,
      source: { type: "payout", id: `${payout.id}:returned` },
      transaction: createLedgerTransaction({
        description: `Payout ${payout.id} returned`,
        entries: reversePosting(
          payoutPosting({
            merchantId,
            provider: payout.rail,
            amount: money(payout.amount, currency),
            fee: money(payout.fee, currency),
          }),
        ),
      }),
    },
    event: buildEvent(merchantId, mode, "payout.failed", payout),
  };
}

function settle(deps: AppDeps, id: string, update: PayoutUpdate) {
  return deps.payouts.settle(id, update, settleEffects);
}

type PayAttempt = { payout: StoredPayout } | { skipped: string };

/** Pays one merchant's available balance in their payout currency, once a day. */
async function payMerchant(
  deps: AppDeps,
  merchantId: string,
  mode: ApiKeyMode,
  now: Date,
  onError: (error: unknown) => void = () => {},
): Promise<PayAttempt> {
  const record = await deps.onboarding.get(merchantId);
  const account = record ? await payoutAccount(deps, record) : null;
  if (!record || !account) return { skipped: "Add a bank account in Account setup first." };
  if (record.status === "rejected") return { skipped: "Payouts are paused on this account." };
  if (mode === "live" && (await accountSetup(deps, { id: merchantId, mode })).status !== "active") {
    return { skipped: "Finish account setup to get paid." };
  }
  const route = payoutRouteFor(deps, mode, account.currency, account.bankCode);
  if ("reason" in route) return { skipped: route.reason };
  if (!account.bankCode) return { skipped: "Choose your bank again in Account setup → Payout." };
  const day = now.toISOString().slice(0, 10);
  const currency = account.currency.toLowerCase();
  const today = (await deps.payouts.list(merchantId, mode, 10)).find(
    (p) => p.day === day && p.payout.currency === currency,
  );
  if (today) {
    return {
      skipped:
        today.payout.status === "failed"
          ? "Today's payout didn't go through; it tries again tomorrow."
          : "You've already been paid out today; the next payout goes tomorrow.",
    };
  }
  const nowSec = Math.floor(now.getTime() / 1000);
  const balance = await merchantBalance(deps, { id: merchantId, mode }, nowSec);
  const available =
    balance.data.find((b) => b.currency === account.currency.toLowerCase())?.available ?? 0;
  const minimum = minimumPayout(account.currency);
  if (available < minimum) {
    return {
      skipped: `Payouts start once ${shown(money(minimum, account.currency))} is available; you have ${shown(money(Math.max(available, 0), account.currency))}.`,
    };
  }
  const amounts = payoutAmounts(route.rail, money(available, account.currency));
  if (!amounts) return { skipped: "The available balance doesn't cover the transfer fee yet." };

  const id = newId("payout");
  const stored: StoredPayout = {
    merchantId,
    mode,
    day,
    payout: {
      id,
      object: "payout",
      livemode: mode === "live",
      status: "pending",
      amount: amounts.amount.amount,
      fee: amounts.fee.amount,
      currency,
      rail: route.id,
      destination: { bank_name: account.bankName, last4: account.last4 },
      // Paystack references: lowercase letters, digits, "-" and "_".
      provider_reference: id.toLowerCase().replace("_", "-"),
      failure_message: null,
      created: nowSec,
    },
  };
  const taken: Effects = {
    ledger: {
      mode,
      source: { type: "payout", id },
      transaction: createLedgerTransaction({
        description: `Payout ${id}`,
        entries: payoutPosting({
          merchantId,
          provider: route.id,
          amount: amounts.amount,
          fee: amounts.fee,
        }),
      }),
    },
  };
  if (!(await deps.payouts.create(stored, taken))) {
    return { skipped: "You've already been paid out today; the next payout goes tomorrow." };
  }
  const result = await route.rail.send({
    reference: stored.payout.provider_reference,
    amount: amounts.amount,
    recipient: {
      name: account.name,
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
    },
    reason: `VRS Pay payout ${id}`,
  });
  if (result.detail) onError(new Error(`Payout ${id} to ${route.id} failed: ${result.detail}`));
  if (result.status === "pending") return { payout: stored };
  const settled = await settle(deps, id, {
    status: result.status,
    failureMessage: result.failureMessage,
  });
  return { payout: settled ?? stored };
}

/** "Pay out now" from the dashboard: today's payout, early. Errors say why it can't go. */
export async function payOutNow(
  deps: AppDeps,
  merchant: { id: string; mode: ApiKeyMode },
  now = new Date(),
) {
  const attempt = await payMerchant(deps, merchant.id, merchant.mode, now);
  if ("skipped" in attempt) throw invalidRequest("payout_not_sent", attempt.skipped);
  return attempt.payout.payout;
}

/** Asks the provider about payouts it never answered, so none stay pending forever. */
async function checkPending(deps: AppDeps, now: Date, onError: (error: unknown) => void) {
  const before = Math.floor(now.getTime() / 1000) - CHECK_AFTER_SECONDS;
  for (const stored of await deps.payouts.pendingBefore(before)) {
    const route = payoutRouteFor(deps, stored.mode, stored.payout.currency);
    if ("reason" in route) continue;
    try {
      const result = await route.rail.verify(stored.payout.provider_reference);
      if (result.status !== "pending") {
        await settle(deps, stored.payout.id, {
          status: result.status,
          failureMessage: result.failureMessage,
        });
      }
    } catch (error) {
      onError(error);
    }
  }
}

/**
 * The daily payout run: every merchant with a bank account gets their
 * available balance (past the hold, over the minimum) sent once a day, less
 * the provider's transfer fee. Safe to run as often as you like.
 */
export async function runPayouts(
  deps: AppDeps,
  now = new Date(),
  onError: (error: unknown) => void = () => {},
): Promise<StoredPayout[]> {
  await checkPending(deps, now, onError);
  const made: StoredPayout[] = [];
  for (const merchantId of await deps.onboarding.withPayoutAccount()) {
    for (const mode of MODES) {
      try {
        const attempt = await payMerchant(deps, merchantId, mode, now, onError);
        if ("payout" in attempt) made.push(attempt.payout);
      } catch (error) {
        onError(error);
      }
    }
  }
  return made;
}

/** A provider's word on a transfer: paid, failed, or returned by the bank. */
export async function syncPayout(
  deps: AppDeps,
  provider: ProviderId,
  data: PayoutUpdatedData,
): Promise<EventOutcome> {
  const stored = await deps.payouts.find(provider, data.payoutReference);
  if (!stored) return "ignored";
  if (data.status === "pending") return "duplicate";
  const settled = await settle(deps, stored.payout.id, {
    status: data.status,
    failureMessage: data.failureMessage,
  });
  return settled ? "processed" : "duplicate";
}

/** Runs the payout check every hour, one pass at a time. Returns a stop function. */
export function startPayoutWorker(
  deps: AppDeps,
  onError: (error: unknown) => void,
  intervalMs = 60 * 60_000,
): () => void {
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await runPayouts(deps, new Date(), onError);
    } catch (error) {
      onError(error);
    } finally {
      running = false;
    }
  };
  const first = setTimeout(run, 60_000);
  const timer = setInterval(run, intervalMs);
  return () => {
    clearTimeout(first);
    clearInterval(timer);
  };
}

/** How and when the merchant is paid, for the Balance page. */
export async function payoutSchedule(deps: AppDeps, merchant: { id: string; mode: ApiKeyMode }) {
  const record = await deps.onboarding.get(merchant.id);
  const currency = CurrencyCodeSchema.safeParse(record?.payoutCurrency ?? "");
  if (!record?.payoutDetails || !currency.success) {
    return {
      schedule: "daily" as const,
      currency: null,
      minimum: null,
      ready: false,
      reason: "Add a bank account in Account setup to get paid.",
    };
  }
  const route = payoutRouteFor(deps, merchant.mode, currency.data);
  return {
    schedule: "daily" as const,
    currency: currency.data.toLowerCase(),
    minimum: minimumPayout(currency.data),
    ready: !("reason" in route),
    reason: "reason" in route ? route.reason : null,
  };
}

/** The rail that pays naira in this mode, or an error saying it isn't set up. */
export function nairaRail(deps: AppDeps, mode: ApiKeyMode): PayoutRail {
  const route = payoutRouteFor(deps, mode, "NGN");
  if ("reason" in route) throw invalidRequest("payouts_unavailable", route.reason);
  return route.rail;
}
