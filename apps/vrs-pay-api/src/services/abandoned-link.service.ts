import type { AppDeps } from "../app.types";
import type { StoredCheckoutSession } from "./checkout-session.types";
import { PAYMENT_LINK_METADATA_KEY } from "./payment-link.service";

/**
 * A subscription link makes a customer for each visitor who starts its
 * checkout. When that checkout expires unpaid, the customer goes, with its
 * incomplete subscription, so abandoned visits leave nothing behind.
 * Customers who paid (they have an email) or subscribed are kept.
 */
export async function removeAbandonedLinkCustomer(deps: AppDeps, stored: StoredCheckoutSession) {
  const { merchantId, mode, session } = stored;
  if (session.mode !== "subscription" || !session.payment_link || !session.customer) return;
  const record = await deps.customers.get(merchantId, mode, session.customer);
  if (!record || record.customer.email) return;
  if (record.customer.metadata[PAYMENT_LINK_METADATA_KEY] !== session.payment_link) return;
  const subscriptions = await deps.billing.listSubscriptions(
    { merchantId, mode },
    session.customer,
  );
  if (subscriptions.some((s) => s.subscription.status !== "incomplete")) return;
  await deps.customers.remove(merchantId, mode, session.customer);
}
