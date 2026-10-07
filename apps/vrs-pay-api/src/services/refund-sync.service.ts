import type { ProviderId, RefundUpdatedData } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { ProviderAccountOwner } from "../stores/provider-account.store";
import type { EventOutcome } from "./capture.service";
import type { StoredRefund } from "./refund.types";
import { newRefund, refundEffects } from "./refund-effects";

/** On the platform account (`owner` null) any record of ours matches; otherwise it must be that merchant's. */
function belongs(
  record: { merchantId: string; mode: string },
  owner: ProviderAccountOwner | null,
): boolean {
  return !owner || (record.merchantId === owner.merchantId && record.mode === owner.mode);
}

/** A refund made outside VRS Pay (e.g. in the Stripe Dashboard), recorded so totals stay right. */
async function adoptExternalRefund(
  deps: AppDeps,
  owner: ProviderAccountOwner | null,
  provider: ProviderId,
  data: RefundUpdatedData,
): Promise<StoredRefund | null> {
  if (data.status === "failed") return null;
  const payment = await deps.payments.findByReference(provider, data.paymentReference);
  if (!payment || !belongs(payment, owner)) return null;
  const record = newRefund(payment, data.amount.amount, {
    reason: null,
    metadata: {},
    provider_reference: data.refundReference,
  });
  return (await deps.refunds.reserve(record)) ? record : null;
}

/** Brings our refund in line with the provider's, writing effects on the final status. */
export async function syncRefund(
  deps: AppDeps,
  owner: ProviderAccountOwner | null,
  provider: ProviderId,
  data: RefundUpdatedData,
): Promise<EventOutcome> {
  const byId = data.refundId ? await deps.refunds.find({ id: data.refundId }) : null;
  const stored =
    byId ??
    (await deps.refunds.find({ provider, reference: data.refundReference })) ??
    (await adoptExternalRefund(deps, owner, provider, data));
  if (!stored || !belongs(stored, owner)) return "ignored";
  const settled = await deps.refunds.settle(
    stored.refund.id,
    { status: data.status, providerReference: data.refundReference },
    refundEffects,
  );
  return settled ? "processed" : "duplicate";
}
