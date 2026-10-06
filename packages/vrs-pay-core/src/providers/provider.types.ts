import type { CurrencyCode } from "../money/currency";
import type { Money } from "../money/money.types";

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
  /** Stripe connected account (`acct_…`) or Paystack/Flutterwave subaccount. */
  merchantAccountId: string;
  sessionId: string;
  amount: Money;
  method: PaymentMethod;
  /** VRS Pay's application fee, taken by the provider at charge time. */
  platformFee: Money;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata: Record<string, string>;
  /** Forwarded so provider calls are idempotent too. */
  idempotencyKey: string;
}

export interface ProviderCheckout {
  provider: ProviderId;
  /** The provider's id for the session/transaction. */
  reference: string;
  /** Where to send the customer (hosted payment page). */
  url: string;
}

export interface ProviderRefundInput {
  merchantAccountId: string;
  paymentReference: string;
  amount: Money;
  idempotencyKey: string;
}

export interface ProviderRefund {
  provider: ProviderId;
  reference: string;
  status: "pending" | "succeeded" | "failed";
}

/** A provider webhook normalized into VRS terms (e.g. `payment.succeeded`). */
export interface ProviderWebhookEvent {
  provider: ProviderId;
  /** Provider's event id — used to de-duplicate deliveries. */
  id: string;
  type: string;
  occurredAt: number;
  data: Record<string, unknown>;
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
}

export type ProviderRegistry = Readonly<Record<ProviderId, PaymentProvider>>;
