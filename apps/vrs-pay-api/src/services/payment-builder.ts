import {
  type ApiKeyMode,
  createLedgerTransaction,
  type Money,
  money,
  newId,
  type ProviderId,
  salePosting,
} from "@vrs-pay/core";
import type { LedgerPosting } from "./event.types";
import { nowSeconds } from "./events";
import type { StoredPayment } from "./payment.types";

export interface CapturedCharge {
  merchantId: string;
  mode: ApiKeyMode;
  provider: ProviderId;
  providerAccountId: string;
  providerReference: string;
  /** What the buyer paid, tax included. */
  amount: Money;
  platformFee: Money;
  providerFee: Money;
  /** The part of `amount` that is tax; zero or absent when none. */
  tax?: Money;
  checkoutSession: string | null;
  customerEmail: string | null;
  metadata: Record<string, string>;
}

/** A succeeded payment and its ledger capture — the same for checkouts and renewals. */
export function capturedPayment(charge: CapturedCharge): {
  payment: StoredPayment;
  posting: LedgerPosting;
} {
  const { merchantId, mode, provider, amount, platformFee, providerFee } = charge;
  const tax = charge.tax ?? money(0, amount.currency);
  const payment: StoredPayment = {
    merchantId,
    mode,
    providerAccountId: charge.providerAccountId,
    payment: {
      id: newId("payment"),
      object: "payment",
      livemode: mode === "live",
      status: "succeeded",
      amount: amount.amount,
      amount_refunded: 0,
      amount_tax: tax.amount,
      currency: amount.currency.toLowerCase(),
      platform_fee: platformFee.amount,
      provider_fee: providerFee.amount,
      provider,
      provider_reference: charge.providerReference,
      checkout_session: charge.checkoutSession,
      customer_email: charge.customerEmail,
      metadata: charge.metadata,
      created: nowSeconds(),
    },
  };
  const transaction = createLedgerTransaction({
    description: `Capture ${payment.payment.id}`,
    entries: salePosting({ merchantId, provider, amount, providerFee, platformFee, tax }),
  });
  return {
    payment,
    posting: { mode, source: { type: "payment", id: payment.payment.id }, transaction },
  };
}
