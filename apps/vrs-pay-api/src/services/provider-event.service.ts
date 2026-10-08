import type { ProviderWebhookEvent } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { ProviderAccountOwner } from "../stores/provider-account.store";
import { removeAbandonedLinkCustomer } from "./abandoned-link.service";
import { type EventOutcome, ownedSession, recordCheckoutPayment } from "./capture.service";
import { fillMissingEmail } from "./customer.service";
import { buildEvent } from "./events";
import { syncIdentitySession } from "./identity.service";
import { syncRefund } from "./refund-sync.service";
import { activateSubscription } from "./subscription-activation.service";

/** The merchant behind a connected account, null for platform events, undefined if not ours. */
async function ownerOf(
  deps: AppDeps,
  event: ProviderWebhookEvent,
): Promise<ProviderAccountOwner | null | undefined> {
  if (!event.account) return null;
  return (await deps.providerAccounts.findOwner(event.provider, event.account)) ?? undefined;
}

async function handle(
  deps: AppDeps,
  event: ProviderWebhookEvent,
  owner: ProviderAccountOwner | null,
): Promise<EventOutcome> {
  const { provider, account } = event;
  switch (event.type) {
    case "checkout.completed": {
      const session = await ownedSession(deps, owner, provider, event.data.sessionReference);
      if (!session) return "ignored";
      if (session.session.mode !== "subscription") {
        const outcome = await recordCheckoutPayment(deps, session, provider, account, event.data);
        if (outcome === "processed") {
          await fillMissingEmail(
            deps,
            session,
            session.session.customer,
            event.data.customerEmail,
            event.data.customerName,
            event.data.customerCountry,
          );
        }
        return outcome;
      }
      const outcome = await activateSubscription(
        deps,
        session,
        account,
        event.data.savedMethod,
        event.data,
      );
      if (outcome === "processed") {
        await fillMissingEmail(
          deps,
          session,
          session.session.customer,
          event.data.customerEmail,
          event.data.customerName,
          event.data.customerCountry,
        );
      }
      return outcome;
    }
    case "checkout.setup_completed": {
      const session = await ownedSession(deps, owner, provider, event.data.sessionReference);
      if (session?.session.mode !== "subscription") return "ignored";
      const outcome = await activateSubscription(deps, session, account, event.data.savedMethod, null);
      if (outcome === "processed") {
        await fillMissingEmail(
          deps,
          session,
          session.session.customer,
          event.data.customerEmail,
          event.data.customerName,
          event.data.customerCountry,
        );
      }
      return outcome;
    }
    case "refund.updated":
      return syncRefund(deps, owner, provider, event.data);
    case "checkout.expired": {
      const session = await ownedSession(deps, owner, provider, event.data.sessionReference);
      const expired = session
        ? await deps.checkoutSessions.expire(session.session.id, (s) => ({
            event: buildEvent(s.merchantId, s.mode, "checkout.session.expired", s.session),
          }))
        : null;
      if (expired && session) await removeAbandonedLinkCustomer(deps, session);
      return expired ? "processed" : "ignored";
    }
    case "account.updated":
      if (!owner) return "ignored";
      await deps.providerAccounts.updateStatus(provider, event.data);
      return "processed";
    case "identity.updated":
      return owner ? "ignored" : syncIdentitySession(deps, event.data);
    default:
      return "ignored";
  }
}

/**
 * Acts on a verified provider webhook. Most payments run on the platform
 * account, which other apps share, so anything we didn't create (no
 * matching session, payment or refund) is ignored. Handlers are idempotent;
 * handled event ids are remembered so redeliveries short-circuit.
 */
export async function handleProviderEvent(
  deps: AppDeps,
  event: ProviderWebhookEvent,
): Promise<EventOutcome> {
  if (event.type === "ignored") return "ignored";
  if (await deps.providerEvents.has(event.provider, event.id)) return "duplicate";
  const owner = await ownerOf(deps, event);
  if (owner === undefined) return "ignored";
  const outcome = await handle(deps, event, owner);
  if (outcome !== "ignored") await deps.providerEvents.add(event.provider, event.id, event.type);
  return outcome;
}
