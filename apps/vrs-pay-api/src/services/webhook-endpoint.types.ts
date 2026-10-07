import type { ApiKeyMode } from "@vrs-pay/core";

/** The public shape of a webhook endpoint. `secret` is only returned on create. */
export interface WebhookEndpoint {
  id: string;
  object: "webhook_endpoint";
  livemode: boolean;
  url: string;
  /** Event types sent here; ["*"] means all. */
  enabled_events: string[];
  status: "enabled" | "disabled";
  /** Unix seconds. */
  created: number;
  secret?: string;
}

export interface StoredWebhookEndpoint {
  merchantId: string;
  mode: ApiKeyMode;
  secret: string;
  endpoint: WebhookEndpoint;
}

/** A delivery that is due, with everything needed to send it. */
export interface DueDelivery {
  id: string;
  attempts: number;
  url: string;
  secret: string;
  /** The JSON body to send (the public event). */
  payload: string;
}

export interface DeliveryFailure {
  attempts: number;
  /** Null when retries are exhausted. */
  nextAttemptAt: Date | null;
  statusCode: number | null;
  error: string;
}
