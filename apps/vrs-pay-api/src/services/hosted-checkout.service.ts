import { CurrencyCodeSchema, invalidRequest, money, resourceMissing } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import { providersFor } from "./platform";

/** Our own checkout page for a session; providers that redirect elsewhere replace it. */
export function hostedPageUrl(deps: AppDeps, sessionId: string): string {
  return `${deps.urls.site}/pay/${sessionId}`;
}

/**
 * Starts the provider's payment page for an open session once the buyer has
 * given their email (Paystack needs one up front). Starting again returns
 * the same page.
 */
export async function startHostedCheckout(
  deps: AppDeps,
  sessionId: string,
  email: string,
): Promise<{ url: string }> {
  const stored = await deps.checkoutSessions.findById(sessionId);
  if (!stored) throw resourceMissing("checkout session", sessionId);
  const { session, mode, merchantId } = stored;
  if (session.status !== "open") {
    throw invalidRequest("session_closed", "This checkout has already finished.");
  }
  const notNeeded = () => invalidRequest("not_needed", "This checkout takes payment on this page.");
  if (session.provider === "stripe") throw notNeeded();
  const ours = hostedPageUrl(deps, session.id);
  if (session.url !== ours) return { url: session.url };
  if (session.mode !== "payment") throw notNeeded();
  const currency = CurrencyCodeSchema.parse(session.currency);
  const profile = await deps.providerAccounts.merchantProfile(merchantId, mode);
  const metadata = Object.fromEntries(
    Object.entries(session.metadata).filter(([key]) => !key.startsWith("_")),
  );
  const checkout = await providersFor(deps, mode)[session.provider].createCheckout({
    merchantAccountId: null,
    statementDescriptor: profile?.name,
    sessionId: session.id,
    amount: money(session.amount, currency),
    method: session.payment_method,
    description: session.description ?? undefined,
    platformFee: money(session.platform_fee, currency),
    successUrl: session.success_url,
    cancelUrl: session.cancel_url,
    customerEmail: email,
    metadata,
    idempotencyKey: `${session.id}-start`,
    hostedUrl: ours,
  });
  if (!checkout.url || checkout.url === ours) {
    throw invalidRequest(
      "checkout_unavailable",
      "The payment page couldn't be started. Try again.",
    );
  }
  if (!(await deps.checkoutSessions.setHostedCheckout(session.id, checkout.url, email))) {
    throw invalidRequest("session_closed", "This checkout has already finished.");
  }
  return { url: checkout.url };
}
