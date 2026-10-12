import type { Money } from "../money/money.types";
import type { ProviderId } from "./provider.types";
import type { SavedMethod } from "./provider-billing.types";

interface ProviderEventBase {
  provider: ProviderId;
  /** Provider's event id — used to de-duplicate deliveries. */
  id: string;
  /** The merchant's connected account / subaccount, when the event came from one. */
  account: string | null;
  /** Unix seconds. */
  occurredAt: number;
}

/** A hosted checkout was paid. Fees are what the provider actually took. */
export interface CheckoutCompletedData {
  /** Provider's checkout id (e.g. Stripe `cs_…`). */
  sessionReference: string;
  /** Our `cs_…` id, echoed back through provider metadata. */
  sessionId: string | null;
  /** Provider's payment id (e.g. Stripe `pi_…`). */
  paymentReference: string;
  /** What the buyer paid, tax included. */
  amount: Money;
  /** The part of `amount` that is tax, owed to tax authorities; absent when none. */
  tax?: Money;
  platformFee: Money;
  /** Zero when the provider settled in another currency or hasn't reported it yet. */
  providerFee: Money;
  customerEmail: string | null;
  customerName?: string | null;
  customerCountry?: string | null;
  /** Set when the checkout saved the card for later charges. */
  savedMethod: SavedMethod | null;
  providerCustomer: string | null;
}

/** A setup-mode checkout saved a card without charging (trial starts). */
export interface CheckoutSetupData {
  sessionReference: string;
  sessionId: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  customerCountry?: string | null;
  providerCustomer: string | null;
  savedMethod: SavedMethod;
}

export type ProviderRefundStatus = "pending" | "succeeded" | "failed";

export interface RefundUpdatedData {
  refundReference: string;
  /** Our `re_…` id, echoed back through provider metadata. Null for refunds made outside VRS Pay. */
  refundId: string | null;
  paymentReference: string;
  status: ProviderRefundStatus;
  amount: Money;
}

export type ProviderDisputeStatus = "open" | "won" | "lost";

/**
 * A chargeback: the buyer asked their bank to reverse a payment. Amounts are
 * in the payment's currency and are running totals, so replaying an event
 * changes nothing.
 */
export interface DisputeUpdatedData {
  /** Provider's dispute id (e.g. Stripe `dp_…`). */
  disputeReference: string;
  paymentReference: string;
  status: ProviderDisputeStatus;
  /** The bank's reason, e.g. "fraudulent" or "product_not_received". */
  reason: string | null;
  /** The disputed amount. */
  amount: Money;
  /** What the provider has taken back so far, net of anything returned. */
  withdrawn: Money;
  /** The provider's dispute fee kept so far, net of any returned. */
  fee: Money;
  /** Unix seconds: the last moment to send evidence; null when there's nothing to answer. */
  evidenceDueBy: number | null;
}

export type ProviderPayoutStatus = "pending" | "paid" | "failed";

/** A payout to a merchant's bank moved on (sent, failed, or reversed by the bank). */
export interface PayoutUpdatedData {
  /** The reference we sent the transfer with. */
  payoutReference: string;
  status: ProviderPayoutStatus;
  failureMessage: string | null;
}

export interface AccountUpdatedData {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

/** A merchant's ID check session moved on (document submitted, verified, failed). */
export interface IdentityUpdatedData {
  sessionReference: string;
  merchantId: string;
}

/** A provider webhook normalized into the few things VRS Pay acts on. */
export type ProviderWebhookEvent = ProviderEventBase &
  (
    | { type: "checkout.completed"; data: CheckoutCompletedData }
    | { type: "checkout.setup_completed"; data: CheckoutSetupData }
    | { type: "checkout.expired"; data: { sessionReference: string } }
    | { type: "refund.updated"; data: RefundUpdatedData }
    | { type: "dispute.updated"; data: DisputeUpdatedData }
    | { type: "payout.updated"; data: PayoutUpdatedData }
    | { type: "account.updated"; data: AccountUpdatedData }
    | { type: "identity.updated"; data: IdentityUpdatedData }
    | { type: "ignored"; data: { providerType: string } }
  );

export type ProviderWebhookEventType = ProviderWebhookEvent["type"];
