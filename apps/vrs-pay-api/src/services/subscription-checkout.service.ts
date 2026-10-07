import { invalidRequest, money, newId, resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { SubscriptionCheckoutInput } from "../routes/subscription-checkout.schema";
import { findRecurringPrice, periodAmount } from "./billing-helpers";
import type { CheckoutSession } from "./checkout-session.types";
import { nowSeconds } from "./events";
import { assertCanCharge } from "./live-gate";
import { feeFor, providersFor, routeOnPlatform } from "./platform";
import { providerCustomerFor } from "./provider-customer";
import type { StoredSubscription } from "./subscription.types";

export const SUBSCRIPTION_METADATA_KEY = "vrs_subscription_id";

/**
 * Starts a subscription: an `incomplete` subscription plus a checkout that
 * charges the first period and saves the card — or, for a trial, only
 * saves the card.
 */
export async function createSubscriptionCheckout(
  deps: AppDeps,
  merchant: MerchantContext,
  input: SubscriptionCheckoutInput,
  idempotencyKey?: string,
  paymentLink: string | null = null,
): Promise<CheckoutSession> {
  await assertCanCharge(deps, merchant);
  const scope = { merchantId: merchant.id, mode: merchant.mode };
  const { plan, price, interval } = await findRecurringPrice(deps.catalog, scope, input.price);
  if (!plan.active || !price.active) {
    throw invalidRequest("price_inactive", "This price is no longer for sale.", "price");
  }
  const customer = (await deps.customers.get(merchant.id, merchant.mode, input.customer))?.customer;
  if (!customer) throw resourceMissing("customer", input.customer);
  if (plan.payer !== customer.type) {
    throw invalidRequest(
      "payer_mismatch",
      `The ${plan.key} plan is for ${plan.payer}s, not ${customer.type}s.`,
      "customer",
    );
  }
  if (plan.payer === "user" && input.quantity !== 1) {
    throw invalidRequest("quantity_invalid", "Only organization plans have seats.", "quantity");
  }

  const amount = periodAmount(price, input.quantity);
  const route = routeOnPlatform(deps, merchant.mode, amount.currency, "card");
  const providerCustomer = await providerCustomerFor(deps, route.provider, null, customer);

  const now = nowSeconds();
  const subscription: StoredSubscription = {
    merchantId: merchant.id,
    mode: merchant.mode,
    provider: route.provider,
    version: 0,
    subscription: {
      id: newId("subscription"),
      object: "subscription",
      livemode: merchant.mode === "live",
      customer: customer.id,
      plan: plan.id,
      price: price.id,
      status: "incomplete",
      quantity: input.quantity,
      current_period_start: null,
      current_period_end: null,
      trial_end: null,
      cancel_at_period_end: false,
      canceled_at: null,
      pending_price: null,
      pending_quantity: null,
      payment_method: null,
      created: now,
    },
  };
  await deps.billing.commit({ subscriptions: [{ record: subscription, expectedVersion: null }] });

  const trial = plan.trial_days > 0;
  const id = newId("checkoutSession");
  const description = `${plan.name} · ${interval === "month" ? "monthly" : "yearly"}`;
  const platformFee = trial ? money(0, amount.currency) : feeFor(merchant, amount);
  const metadata = { ...input.metadata, [SUBSCRIPTION_METADATA_KEY]: subscription.subscription.id };
  const checkout = await providersFor(deps, merchant.mode)[route.provider].createCheckout({
    merchantAccountId: null,
    statementDescriptor: merchant.name,
    sessionId: id,
    amount,
    method: "card",
    description,
    platformFee,
    successUrl: input.success_url,
    cancelUrl: input.cancel_url,
    metadata,
    idempotencyKey: idempotencyKey ?? id,
    mode: trial ? "setup" : "payment",
    providerCustomer,
    saveMethod: true,
  });

  const session: CheckoutSession = {
    id,
    object: "checkout.session",
    livemode: merchant.mode === "live",
    status: "open",
    mode: "subscription",
    customer: customer.id,
    subscription: subscription.subscription.id,
    payment_link: paymentLink,
    amount: trial ? 0 : amount.amount,
    currency: amount.currency.toLowerCase(),
    payment_method: "card",
    description,
    provider: checkout.provider,
    provider_reference: checkout.reference,
    url: checkout.url,
    platform_fee: platformFee.amount,
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    customer_email: customer.email,
    metadata: input.metadata,
    created: now,
  };
  await deps.checkoutSessions.save({ merchantId: merchant.id, mode: merchant.mode, session });
  return session;
}
