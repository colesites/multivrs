import {
  calculatePlatformFee,
  invalidRequest,
  money,
  newId,
  resourceMissing,
  routePayment,
} from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { CreateCheckoutSessionInput } from "../routes/checkout-session.schema";
import type { CheckoutSession } from "./checkout-session.types";

/**
 * Creates a hosted checkout: route to the best connected provider, take our
 * fee, ask the provider for a payment page, store the session.
 */
export async function createCheckoutSession(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreateCheckoutSessionInput,
  idempotencyKey?: string,
): Promise<CheckoutSession> {
  const amount = money(input.amount, input.currency);
  const connected = merchant.enabledProviders.filter((p) => merchant.providerAccounts[p]);
  const route = routePayment({
    currency: input.currency,
    method: input.payment_method,
    enabledProviders: connected,
  });
  const merchantAccountId = merchant.providerAccounts[route.provider];
  if (!merchantAccountId) {
    throw invalidRequest("provider_account_missing", `Not connected to ${route.provider}.`);
  }

  const id = newId("checkoutSession");
  const platformFee = calculatePlatformFee(amount, merchant.platformFeeBps);
  const checkout = await deps.providers[route.provider].createCheckout({
    merchantAccountId,
    sessionId: id,
    amount,
    method: input.payment_method,
    platformFee,
    successUrl: input.success_url,
    cancelUrl: input.cancel_url,
    customerEmail: input.customer_email,
    metadata: input.metadata,
    idempotencyKey: idempotencyKey ?? id,
  });

  const session: CheckoutSession = {
    id,
    object: "checkout.session",
    livemode: merchant.mode === "live",
    status: "open",
    amount: amount.amount,
    currency: amount.currency.toLowerCase(),
    payment_method: input.payment_method,
    provider: checkout.provider,
    provider_reference: checkout.reference,
    url: checkout.url,
    platform_fee: platformFee.amount,
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    customer_email: input.customer_email ?? null,
    metadata: input.metadata,
    created: Math.floor(Date.now() / 1000),
  };
  await deps.checkoutSessions.save({ merchantId: merchant.id, mode: merchant.mode, session });
  return session;
}

export async function getCheckoutSession(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
): Promise<CheckoutSession> {
  const session = await deps.checkoutSessions.get(merchant.id, merchant.mode, id);
  if (!session) throw resourceMissing("checkout session", id);
  return session;
}
