import type { CurrencyCode } from "../money/currency";
import type { Money } from "../money/money.types";
import type {
  ChargeSavedInput,
  ChargeSavedResult,
  ProviderCustomerInput,
} from "./provider-billing.types";
import type { ProviderRefundStatus, ProviderWebhookEvent } from "./provider-events.types";

export const PROVIDER_IDS = ["stripe", "paystack", "flutterwave"] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export const PAYMENT_METHODS = [
  "card",
  "apple_pay",
  "google_pay",
  "sepa_debit",
  "bank_transfer",
  "ussd",
  "mobile_money",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface ProviderCapabilities {
  currencies: readonly CurrencyCode[];
  methods: readonly PaymentMethod[];
}

export interface ProviderCheckoutInput {
  /** A merchant's own provider account, or null to charge on the platform account. */
  merchantAccountId: string | null;
  /** Shown on the customer's statement after the platform's prefix (merchant name). */
  statementDescriptor?: string;
  sessionId: string;
  amount: Money;
  method: PaymentMethod;
  /** What the customer sees on the payment page. */
  description?: string;
  /** VRS Pay's application fee, taken by the provider at charge time. */
  platformFee: Money;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata: Record<string, string>;
  /** Forwarded so provider calls are idempotent too. */
  idempotencyKey: string;
  /** `setup` saves a card without charging (e.g. to start a trial). */
  mode?: "payment" | "setup";
  /** The provider-side customer the saved card is attached to. */
  providerCustomer?: string;
  /** Save the card for later off-session charges (subscriptions). */
  saveMethod?: boolean;
}

export interface ProviderCheckout {
  provider: ProviderId;
  /** The provider's id for the session/transaction. */
  reference: string;
  /** Where to send the customer (hosted payment page). */
  url: string;
}

export interface ProviderRefundInput {
  merchantAccountId: string | null;
  paymentReference: string;
  amount: Money;
  /** Our `re_…` id, sent as metadata so webhooks can be matched back. */
  refundId: string;
  reason?: RefundReason;
  idempotencyKey: string;
}

export const REFUND_REASONS = ["duplicate", "fraudulent", "requested_by_customer"] as const;
export type RefundReason = (typeof REFUND_REASONS)[number];

export interface ProviderRefund {
  provider: ProviderId;
  reference: string;
  status: ProviderRefundStatus;
}

/**
 * What every provider adapter implements. Providers only move money;
 * billing logic (plans, renewals, dunning) stays in VRS Pay.
 */
export interface PaymentProvider {
  readonly id: ProviderId;
  readonly capabilities: ProviderCapabilities;
  createCheckout(input: ProviderCheckoutInput): Promise<ProviderCheckout>;
  refund(input: ProviderRefundInput): Promise<ProviderRefund>;
  parseWebhook(input: { rawBody: string; headers: Headers }): Promise<ProviderWebhookEvent>;
  /** Creates the customer's record on the merchant's account; returns its id. */
  ensureCustomer(input: ProviderCustomerInput): Promise<{ reference: string }>;
  /** Charges a saved method with nobody present (renewals, upgrades). */
  chargeSaved(input: ChargeSavedInput): Promise<ChargeSavedResult>;
}

export type ProviderRegistry = Readonly<Record<ProviderId, PaymentProvider>>;
