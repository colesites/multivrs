import {
  createLedgerTransaction,
  type DisputeUpdatedData,
  disputePosting,
  isCurrencyCode,
  money,
  newId,
  type ProviderId,
  reversePosting,
} from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { ProviderAccountOwner } from "../stores/provider-account.store";
import type { EventOutcome } from "./capture.service";
import type { Dispute, StoredDispute } from "./dispute.types";
import type { Effects, EventType, LedgerPosting } from "./event.types";
import { buildEvent, nowSeconds } from "./events";
import type { StoredPayment } from "./payment.types";
import { belongs } from "./refund-sync.service";

/** Saves that lose a race re-read and try again this many times. */
const SAVE_ATTEMPTS = 3;

/** The tax inside `withdrawn` of a payment, in proportion to the payment's tax. */
function taxWithin(payment: StoredPayment["payment"], withdrawn: number): number {
  if (payment.amount_tax <= 0 || payment.amount <= 0) return 0;
  return Math.round((Math.min(withdrawn, payment.amount) * payment.amount_tax) / payment.amount);
}

/**
 * What moved in the merchant's balance between two versions of a dispute:
 * money taken (amount, fee) is charged to the balance, money returned
 * (a won dispute) goes back. Posted once per version.
 */
function balanceChange(
  stored: StoredPayment,
  before: Dispute | null,
  after: StoredDispute,
): LedgerPosting | undefined {
  const { dispute } = after;
  const currency = dispute.currency.toUpperCase();
  if (!isCurrencyCode(currency)) throw new Error(`Unsupported dispute currency ${currency}.`);
  const prior = { withdrawn: before?.amount_withdrawn ?? 0, fee: before?.fee ?? 0 };
  const withdrawn = dispute.amount_withdrawn - prior.withdrawn;
  const fee = dispute.fee - prior.fee;
  const tax =
    taxWithin(stored.payment, dispute.amount_withdrawn) -
    taxWithin(stored.payment, prior.withdrawn);
  if (withdrawn === 0 && fee === 0) return undefined;
  const part = (n: number) => money(Math.max(n, 0), currency);
  const posting = (sign: 1 | -1) =>
    disputePosting({
      merchantId: after.merchantId,
      provider: after.provider,
      amount: part(sign * withdrawn),
      fee: part(sign * fee),
      tax: part(sign * tax),
    });
  return {
    mode: after.mode,
    source: { type: "dispute", id: `${dispute.id}:${after.version}` },
    transaction: createLedgerTransaction({
      description: `Dispute ${dispute.id} on ${dispute.payment}`,
      entries: [...posting(1), ...reversePosting(posting(-1))],
    }),
  };
}

/** Merchant events for the change: opened, closed (won or lost), or anything else that moved. */
function eventTypesFor(before: Dispute | null, after: Dispute): EventType[] {
  const closed = after.status !== "open" && before?.status !== after.status;
  if (!before) return closed ? ["dispute.created", "dispute.closed"] : ["dispute.created"];
  return [closed ? "dispute.closed" : "dispute.updated"];
}

function sameState(a: Dispute, b: Dispute): boolean {
  return (
    a.status === b.status &&
    a.amount === b.amount &&
    a.amount_withdrawn === b.amount_withdrawn &&
    a.fee === b.fee &&
    a.reason === b.reason &&
    a.evidence_due_by === b.evidence_due_by
  );
}

function nextDispute(
  stored: StoredPayment,
  provider: ProviderId,
  current: StoredDispute | null,
  data: DisputeUpdatedData,
): StoredDispute {
  return {
    merchantId: stored.merchantId,
    mode: stored.mode,
    provider,
    version: (current?.version ?? -1) + 1,
    dispute: {
      id: current?.dispute.id ?? newId("dispute"),
      object: "dispute",
      livemode: stored.mode === "live",
      status: data.status,
      amount: data.amount.amount,
      currency: data.amount.currency.toLowerCase(),
      amount_withdrawn: data.withdrawn.amount,
      fee: data.fee.amount,
      reason: data.reason,
      evidence_due_by: data.evidenceDueBy,
      payment: stored.payment.id,
      provider_reference: data.disputeReference,
      created: current?.dispute.created ?? nowSeconds(),
    },
  };
}

/**
 * Brings our record of a chargeback in line with the provider's. Whatever
 * the provider takes (the disputed amount and its fee) comes out of the
 * merchant's balance, and comes back if the merchant wins.
 */
export async function syncDispute(
  deps: AppDeps,
  owner: ProviderAccountOwner | null,
  provider: ProviderId,
  data: DisputeUpdatedData,
): Promise<EventOutcome> {
  const stored = await deps.payments.findByReference(provider, data.paymentReference);
  if (!stored || !belongs(stored, owner)) return "ignored";
  if (data.amount.currency.toLowerCase() !== stored.payment.currency) return "ignored";
  for (let attempt = 0; attempt < SAVE_ATTEMPTS; attempt++) {
    const current = await deps.disputes.find(provider, data.disputeReference);
    const next = nextDispute(stored, provider, current, data);
    if (current && sameState(current.dispute, next.dispute)) return "duplicate";
    const before = current?.dispute ?? null;
    const effects: Effects = {
      ledger: balanceChange(stored, before, next),
      events: eventTypesFor(before, next.dispute).map((type) =>
        buildEvent(next.merchantId, next.mode, type, next.dispute),
      ),
    };
    if (await deps.disputes.save(next, current?.version ?? null, effects)) return "processed";
  }
  throw new Error(`Dispute ${data.disputeReference} kept changing while it was saved.`);
}
