import {
  type ChargeSavedInput,
  invalidRequest,
  money,
  type ProviderRefundInput,
  type ProviderTax,
  type ProviderTaxInput,
  type TaxAddress,
} from "@vrs-pay/core";
import type Stripe from "stripe";
import type { StripeApi } from "./stripe-api.types";
import { call } from "./stripe-call";
import { requestOptions } from "./stripe-options";

/** PaymentIntent metadata: the tax calculation behind its amount, and the tax inside it. */
export const TAX_CALCULATION_KEY = "vrs_tax_calculation";
export const TAX_AMOUNT_KEY = "vrs_tax_amount";
/** PaymentIntent metadata: the Stripe Tax transaction recorded once it was paid. */
export const TAX_TRANSACTION_KEY = "vrs_tax_transaction";

/** Stripe's address shape, with the country Stripe Tax requires. */
function stripeAddress(a: TaxAddress): Stripe.AddressParam & { country: string } {
  return {
    country: a.country.toUpperCase(),
    ...(a.postalCode ? { postal_code: a.postalCode } : {}),
    ...(a.state ? { state: a.state } : {}),
    ...(a.city ? { city: a.city } : {}),
    ...(a.line1 ? { line1: a.line1 } : {}),
    ...(a.line2 ? { line2: a.line2 } : {}),
  };
}

/** Stripe's answer when an address can't be placed in a tax jurisdiction. */
function isLocationError(error: unknown): boolean {
  return (
    error instanceof Error && "code" in error && error.code === "customer_tax_location_invalid"
  );
}

function logTaxFailure(event: string, reference: string, error: unknown) {
  // biome-ignore lint/suspicious/noConsole: the payment went through; the tax record is retried by hand.
  console.error(
    JSON.stringify({
      event,
      reference,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
}

/**
 * Prices the tax on a pending checkout and puts it on the PaymentIntent, so
 * the buyer pays price + tax. The address is saved on the Stripe customer
 * too, which is where renewals are taxed from.
 */
export async function applyStripeTax(
  api: StripeApi,
  input: ProviderTaxInput,
): Promise<ProviderTax> {
  const options = requestOptions(input.merchantAccountId);
  const address = stripeAddress(input.address);
  const { currency } = input.amount;
  const customer = input.providerCustomer;
  if (customer) await call("customer", () => api.customers.update(customer, { address }, options));
  // A SetupIntent (a card saved for a trial) has nothing to charge yet.
  const intent = input.paymentReference?.startsWith("pi_") ? input.paymentReference : null;
  if (!intent) return { tax: money(0, currency), total: input.amount };

  let calculation: Stripe.Tax.Calculation;
  try {
    calculation = await api.tax.calculations.create(
      {
        currency: currency.toLowerCase(),
        line_items: [
          { amount: input.amount.amount, reference: input.reference, tax_behavior: "exclusive" },
        ],
        customer_details: { address, address_source: "billing" },
      },
      options,
    );
  } catch (error) {
    if (isLocationError(error)) {
      throw invalidRequest(
        "tax_location_invalid",
        "We couldn't work out tax for this address. Check the country and postal code.",
        "address",
      );
    }
    return call("tax_calculation", async () => {
      throw error;
    });
  }
  await call("payment_intent", () =>
    api.paymentIntents.update(
      intent,
      {
        amount: calculation.amount_total,
        metadata: {
          [TAX_CALCULATION_KEY]: calculation.id ?? "",
          [TAX_AMOUNT_KEY]: String(calculation.tax_amount_exclusive),
        },
      },
      options,
    ),
  );
  return {
    tax: money(calculation.tax_amount_exclusive, currency),
    total: money(calculation.amount_total, currency),
  };
}

/**
 * Tax for an off-session charge, at the address saved on the Stripe
 * customer. Null when tax is off or no address is on file, so a renewal
 * still goes through at its price.
 */
export async function renewalTax(
  api: StripeApi,
  input: ChargeSavedInput,
): Promise<Stripe.Tax.Calculation | null> {
  if (!input.addTax) return null;
  try {
    return await api.tax.calculations.create(
      {
        currency: input.amount.currency.toLowerCase(),
        customer: input.providerCustomer,
        line_items: [
          {
            amount: input.amount.amount,
            reference: input.idempotencyKey,
            tax_behavior: "exclusive",
          },
        ],
      },
      requestOptions(input.merchantAccountId, `${input.idempotencyKey}-tax`),
    );
  } catch (error) {
    if (isLocationError(error)) return null;
    throw error;
  }
}

/**
 * Records a paid PaymentIntent's tax as a Stripe Tax transaction (for
 * filing) and notes it on the intent for refunds. A failure is logged, not
 * thrown: the payment itself already succeeded.
 */
export async function commitTax(
  api: StripeApi,
  account: string | null,
  intentId: string,
  calculation: string,
): Promise<void> {
  try {
    const transaction = await api.tax.transactions.createFromCalculation(
      { calculation, reference: intentId },
      requestOptions(account, `${intentId}-tax-transaction`),
    );
    await api.paymentIntents.update(
      intentId,
      { metadata: { [TAX_TRANSACTION_KEY]: transaction.id } },
      requestOptions(account),
    );
  } catch (error) {
    logTaxFailure("tax_transaction_failed", intentId, error);
  }
}

/** Gives back a refund's share of tax on Stripe Tax's books, when the payment had tax. */
export async function reverseTax(api: StripeApi, input: ProviderRefundInput): Promise<void> {
  try {
    const intent = await api.paymentIntents.retrieve(
      input.paymentReference,
      {},
      requestOptions(input.merchantAccountId),
    );
    const transaction = intent.metadata?.[TAX_TRANSACTION_KEY];
    if (!transaction) return;
    await api.tax.transactions.createReversal(
      {
        mode: "partial",
        original_transaction: transaction,
        reference: `refund-${input.refundId}`,
        // The whole refund, tax included, as a negative amount.
        flat_amount: -input.amount.amount,
      },
      requestOptions(input.merchantAccountId, `${input.refundId}-tax-reversal`),
    );
  } catch (error) {
    logTaxFailure("tax_reversal_failed", input.refundId, error);
  }
}

/** The tax a PaymentIntent was priced with, from its metadata; 0 when none. */
export function taxOnIntent(intent: Stripe.PaymentIntent): number {
  const tax = Number(intent.metadata?.[TAX_AMOUNT_KEY] ?? 0);
  return Number.isSafeInteger(tax) && tax > 0 && tax <= intent.amount ? tax : 0;
}
