import { CurrencyCodeSchema, invalidRequest, randomBase62, resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import { createCheckoutSession } from "./checkout-session.service";
import { createCustomer } from "./customer.service";
import { assertCanCharge } from "./live-gate";
import { PAYMENT_LINK_METADATA_KEY, priceForSale } from "./payment-link.service";
import type { StoredPaymentLink } from "./payment-link.types";
import { routeOnPlatform } from "./platform";
import { createSubscriptionCheckout } from "./subscription-checkout.service";

type Sale = Awaited<ReturnType<typeof priceForSale>>;

/**
 * A subscription bought through a link: the visitor becomes a new customer
 * (their email arrives with the paid checkout) and subscribes to the price.
 */
async function subscribe(
  deps: AppDeps,
  merchant: MerchantContext,
  { link }: StoredPaymentLink,
  sale: Sale,
  urls: { success_url: string; cancel_url: string },
) {
  // Check it can be charged before making a customer for this visitor.
  await assertCanCharge(deps, merchant);
  routeOnPlatform(deps, merchant.mode, CurrencyCodeSchema.parse(sale.currency), "card");
  const metadata = { [PAYMENT_LINK_METADATA_KEY]: link.id };
  const customer = await createCustomer(deps, merchant, {
    external_id: `${link.id}_${randomBase62(16)}`,
    type: sale.plan.payer,
    metadata,
  });
  const input = {
    mode: "subscription" as const,
    price: sale.price,
    customer: customer.id,
    currency: CurrencyCodeSchema.parse(sale.currency),
  };
  return createSubscriptionCheckout(
    deps,
    merchant,
    { ...input, quantity: 1, ...urls, metadata },
    undefined,
    link.id,
  );
}

/**
 * Someone opened a link: a fresh checkout on the merchant's account — a
 * payment, or the first period of a subscription. Returns where to send them.
 */
export async function openPaymentLink(deps: AppDeps, id: string): Promise<string> {
  const stored = await deps.paymentLinks.find(id);
  if (!stored) throw resourceMissing("payment link", id);
  if (!stored.link.active)
    throw invalidRequest("payment_link_inactive", "This payment link has been turned off.");
  const profile = await deps.providerAccounts.merchantProfile(stored.merchantId, stored.mode);
  if (!profile) throw resourceMissing("payment link", id);
  const merchant = { ...profile, mode: stored.mode };
  const { link } = stored;
  const thanks = link.after_payment_url ?? `${deps.urls.site}/paid`;
  const canceled = new URL(thanks);
  canceled.searchParams.set("canceled", "1");
  const urls = { success_url: thanks, cancel_url: canceled.toString() };
  // Archiving the product or price stops its links too; renames show up at checkout.
  const sale = link.price ? await priceForSale(deps, merchant, link.price, link.currency) : null;
  if (sale && sale.interval !== "one_time") {
    return (await subscribe(deps, merchant, stored, sale, urls)).url;
  }
  const session = await createCheckoutSession(
    deps,
    merchant,
    {
      amount: sale?.amount ?? link.amount,
      currency: CurrencyCodeSchema.parse(sale?.currency ?? link.currency),
      payment_method: "card",
      description: sale?.description ?? link.description,
      ...urls,
      metadata: { [PAYMENT_LINK_METADATA_KEY]: link.id },
    },
    undefined,
    link.id,
  );
  return session.url;
}
