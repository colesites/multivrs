import type { Money } from "../money/money.types";

/** A card (or Paystack authorization) saved for charging later, off-session. */
export interface SavedMethod {
  /** Stripe `pm_…`, Paystack `AUTH_…`. */
  reference: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
}

export interface ProviderCustomerInput {
  merchantAccountId: string | null;
  /** Our `cus_…` id, stored on the provider customer as metadata. */
  customerId: string;
  email: string | null;
  name: string | null;
  idempotencyKey: string;
}

export interface ChargeSavedInput {
  merchantAccountId: string | null;
  statementDescriptor?: string;
  providerCustomer: string;
  methodRef: string;
  amount: Money;
  platformFee: Money;
  description: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
}

/**
 * Outcome of an off-session charge. `declined` and `requires_action` are
 * answers (retry on the dunning schedule or ask the customer); `error`
 * means we don't know — retrying with the same idempotency key is safe.
 */
export type ChargeSavedResult =
  | { status: "succeeded"; reference: string; platformFee: Money; providerFee: Money }
  | { status: "declined" | "requires_action" | "error"; reference: string | null; message: string };
