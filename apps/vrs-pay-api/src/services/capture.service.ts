import { type CheckoutCompletedData, money, type ProviderId } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { ProviderAccountOwner } from "../stores/provider-account.store";
import type { StoredCheckoutSession } from "./checkout-session.types";
import { buildEvent } from "./events";
import { capturedPayment } from "./payment-builder";
import { PLATFORM_ACCOUNT } from "./platform";

export type EventOutcome = "processed" | "duplicate" | "ignored";

/**
 * A one-off checkout was paid: record the payment, complete the session,
 * post the capture to the ledger and queue `payment.succeeded` — all at
 * once, and only once per provider payment.
 */
export async function recordCheckoutPayment(
  deps: AppDeps,
  stored: StoredCheckoutSession,
  provider: ProviderId,
  account: string | null,
  data: CheckoutCompletedData,
): Promise<EventOutcome> {
  const { merchantId, mode, session } = stored;
  const { payment, posting } = capturedPayment({
    merchantId,
    mode,
    provider,
    providerAccountId: account ?? PLATFORM_ACCOUNT,
    providerReference: data.paymentReference,
    amount: data.amount,
    // The fee we set when creating the session (charged on the platform, it isn't a separate Stripe fee).
    platformFee: money(session.platform_fee, data.amount.currency),
    providerFee: data.providerFee,
    checkoutSession: session.id,
    customerEmail: data.customerEmail ?? session.customer_email,
    metadata: session.metadata,
  });
  const recorded = await deps.payments.recordCapture(payment, {
    ledger: posting,
    event: buildEvent(merchantId, mode, "payment.succeeded", payment.payment),
  });
  return recorded ? "processed" : "duplicate";
}

/**
 * Our session behind a provider checkout. Sessions on the platform account
 * (`owner` null) are ours if we created them; on a merchant's own account
 * they must also belong to that merchant.
 */
export async function ownedSession(
  deps: AppDeps,
  owner: ProviderAccountOwner | null,
  provider: ProviderId,
  sessionReference: string,
): Promise<StoredCheckoutSession | null> {
  const stored = await deps.checkoutSessions.findByReference(provider, sessionReference);
  if (!stored || !owner) return stored;
  return stored.merchantId === owner.merchantId && stored.mode === owner.mode ? stored : null;
}
