import { money, newId, resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { CreateCheckoutSessionInput } from "../routes/checkout-session.schema";
import type { CheckoutSession } from "./checkout-session.types";
import { assertCanCharge } from "./live-gate";
import { assertMinimumAmount, feeFor, providersFor, routeOnPlatform } from "./platform";

/**
 * Creates a hosted checkout on the platform's provider account: route to
 * the best provider for the currency and method, work out our fee, ask the
 * provider for a payment page, store the session.
 */
export async function createCheckoutSession(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreateCheckoutSessionInput,
  idempotencyKey?: string,
  paymentLinkId: string | null = null,
): Promise<CheckoutSession> {
  await assertCanCharge(deps, merchant);
  const amount = money(input.amount, input.currency);
  assertMinimumAmount(amount);
  const route = routeOnPlatform(deps, merchant.mode, input.currency, input.payment_method);
  const id = newId("checkoutSession");
  const platformFee = feeFor(deps, merchant, amount, route.provider);
  const hostedUrl = `${deps.urls.site}/pay/${id}`;
  const checkout = await providersFor(deps, merchant.mode)[route.provider].createCheckout({
    merchantAccountId: null,
    statementDescriptor: merchant.name,
    sessionId: id,
    amount,
    method: input.payment_method,
    description: input.description,
    platformFee,
    successUrl: input.success_url,
    cancelUrl: input.cancel_url,
    customerEmail: input.customer_email,
    metadata: input.metadata,
    idempotencyKey: idempotencyKey ?? id,
    hostedUrl,
  });

  const session: CheckoutSession = {
    id,
    object: "checkout.session",
    livemode: merchant.mode === "live",
    status: "open",
    mode: "payment",
    customer: null,
    subscription: null,
    payment_link: paymentLinkId,
    amount: amount.amount,
    currency: amount.currency.toLowerCase(),
    payment_method: input.payment_method,
    description: input.description ?? null,
    provider: checkout.provider,
    provider_reference: checkout.reference,
    url: checkout.url || hostedUrl,
    client_secret: checkout.clientSecret ?? null,
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
