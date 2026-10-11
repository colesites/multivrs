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

/** One event sent (or being sent) to one endpoint. */
export interface WebhookDelivery {
  id: string;
  object: "webhook_delivery";
  event: string;
  event_type: string;
  status: "pending" | "succeeded" | "failed";
  attempts: number;
  last_status_code: number | null;
  last_error: string | null;
  /** Unix seconds of the next try; null once it succeeded or gave up. */
  next_attempt: number | null;
  /** Unix seconds. */
  delivered: number | null;
  created: number;
}

/** What `POST /v1/webhook_endpoints/:id/test` reports back. */
export interface WebhookTestResult {
  object: "webhook_test";
  ok: boolean;
  status_code: number | null;
  error: string | null;
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
