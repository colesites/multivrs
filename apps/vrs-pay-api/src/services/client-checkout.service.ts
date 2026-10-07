import { CurrencyCodeSchema } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { ClientCheckoutInput } from "../routes/client.schema";
import { createCheckoutSession } from "./checkout-session.service";
import type { StoredCustomer } from "./customer.types";
import { priceForSale } from "./payment-link.service";
import { createSubscriptionCheckout } from "./subscription-checkout.service";

/** Ties a one-time purchase from the browser to the customer who made it. */
export const CLIENT_CUSTOMER_METADATA_KEY = "vrs_customer";

/**
 * `POST /client/v1/checkout`: the signed-in customer picks a price from the
 * pricing table. Recurring prices start a subscription; one-time prices
 * open a payment. Returns the hosted checkout to send them to.
 */
export async function clientCheckout(
  deps: AppDeps,
  merchant: MerchantContext,
  stored: StoredCustomer,
  input: ClientCheckoutInput,
) {
  const sale = await priceForSale(deps, merchant, input.price, input.currency);
  const urls = { success_url: input.success_url, cancel_url: input.cancel_url };
  const currency = CurrencyCodeSchema.parse(sale.currency);
  const session =
    sale.interval === "one_time"
      ? await createCheckoutSession(deps, merchant, {
          amount: sale.amount * input.quantity,
          currency,
          payment_method: "card",
          description: sale.description,
          customer_email: stored.customer.email ?? undefined,
          metadata: { [CLIENT_CUSTOMER_METADATA_KEY]: stored.customer.id },
          ...urls,
        })
      : await createSubscriptionCheckout(deps, merchant, {
          mode: "subscription",
          price: sale.price,
          customer: stored.customer.id,
          quantity: input.quantity,
          currency,
          metadata: {},
          ...urls,
        });
  return { id: session.id, object: "checkout.session" as const, url: session.url };
}
