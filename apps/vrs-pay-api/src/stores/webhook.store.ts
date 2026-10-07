import type { ApiKeyMode } from "@vrs-pay/core";
import type {
  DeliveryFailure,
  DueDelivery,
  StoredWebhookEndpoint,
  WebhookEndpoint,
} from "../services/webhook-endpoint.types";

export interface WebhookEndpointStore {
  create(record: StoredWebhookEndpoint): Promise<void>;
  list(merchantId: string, mode: ApiKeyMode): Promise<WebhookEndpoint[]>;
  /** Stops future deliveries; returns false if no such enabled endpoint. */
  disable(merchantId: string, mode: ApiKeyMode, id: string): Promise<boolean>;
}

/** The outbox. `claimDue` leases rows so concurrent workers don't double-send. */
export interface DeliveryStore {
  claimDue(limit: number, now: Date): Promise<DueDelivery[]>;
  markSucceeded(id: string, statusCode: number, now: Date): Promise<void>;
  markFailed(id: string, failure: DeliveryFailure): Promise<void>;
}
