import {
  CurrencyCodeSchema,
  invalidRequest,
  money,
  resourceMissing,
  type TaxAddress,
} from "@vrs-pay/core";
import type { AppDeps } from "../app.types";

/** What the checkout page shows once the buyer's address is known. */
export interface CheckoutTax {
  object: "checkout_tax";
  currency: string;
  /** The price, minor units. */
  subtotal: number;
  tax: number;
  /** What the buyer pays: subtotal + tax. */
  total: number;
}

/**
 * Adds tax for the buyer's address to an open checkout, before they pay.
 * Asking again (a corrected address) re-prices it. For a checkout that only
 * saves a card, the address is kept for taxing the renewals.
 */
export async function applyCheckoutTax(
  deps: AppDeps,
  sessionId: string,
  address: TaxAddress,
): Promise<CheckoutTax> {
  const stored = await deps.checkoutSessions.findById(sessionId);
  if (!stored) throw resourceMissing("checkout session", sessionId);
  const { session, mode } = stored;
  const provider = deps.modes[mode].providers[session.provider];
  if (!deps.modes[mode].tax || !provider.applyTax) {
    throw invalidRequest("tax_disabled", "Tax isn't switched on for this checkout.");
  }
  if (session.status !== "open") {
    throw invalidRequest("session_closed", "This checkout has already finished.");
  }
  const amount = money(session.amount, CurrencyCodeSchema.parse(session.currency));
  const providerCustomer = session.customer
    ? await deps.billing.getProviderCustomer(session.customer, session.provider)
    : null;
  const { tax, total } = await provider.applyTax({
    merchantAccountId: null,
    paymentReference: session.provider_reference,
    amount,
    address,
    providerCustomer,
    reference: session.id,
  });
  return {
    object: "checkout_tax",
    currency: session.currency,
    subtotal: amount.amount,
    tax: tax.amount,
    total: total.amount,
  };
}
