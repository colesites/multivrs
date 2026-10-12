import type { ApiKeyMode, ProviderDisputeStatus, ProviderId } from "@vrs-pay/core";

/** The public shape of a dispute (what the API returns): a chargeback on a payment. */
export interface Dispute {
  id: string;
  object: "dispute";
  livemode: boolean;
  status: ProviderDisputeStatus;
  /** The disputed amount, minor units. */
  amount: number;
  /** Lowercase ISO code. */
  currency: string;
  /** Taken out of the balance for it: the disputed amount while held or lost, 0 once won. */
  amount_withdrawn: number;
  /** The provider's dispute fee, taken out of the balance, minor units. */
  fee: number;
  /** The bank's reason, e.g. "fraudulent" or "product_not_received". */
  reason: string | null;
  /** Unix seconds: the last moment to send evidence; null when there's nothing to answer. */
  evidence_due_by: number | null;
  payment: string;
  provider_reference: string;
  /** Unix seconds. */
  created: number;
}

export interface StoredDispute {
  merchantId: string;
  mode: ApiKeyMode;
  provider: ProviderId;
  /** Bumped on every change; a save only lands on the version it read. */
  version: number;
  dispute: Dispute;
}
