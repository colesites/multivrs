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
  amount: Money;
  platformFee: Money;
  /** Zero when the provider settled in another currency or hasn't reported it yet. */
  providerFee: Money;
  customerEmail: string | null;
  /** Set when the checkout saved the card for later charges. */
  savedMethod: SavedMethod | null;
  providerCustomer: string | null;
}

/** A setup-mode checkout saved a card without charging (trial starts). */
export interface CheckoutSetupData {
  sessionReference: string;
  sessionId: string | null;
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
    | { type: "account.updated"; data: AccountUpdatedData }
    | { type: "identity.updated"; data: IdentityUpdatedData }
    | { type: "ignored"; data: { providerType: string } }
  );

export type ProviderWebhookEventType = ProviderWebhookEvent["type"];
