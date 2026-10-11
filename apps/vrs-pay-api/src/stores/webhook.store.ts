import type { ApiKeyMode } from "@vrs-pay/core";
import type {
  DeliveryFailure,
  DueDelivery,
  StoredWebhookEndpoint,
  WebhookDelivery,
  WebhookEndpoint,
} from "../services/webhook-endpoint.types";

export interface EndpointPatch {
  url?: string;
  enabledEvents?: string[];
}

export interface WebhookEndpointStore {
  create(record: StoredWebhookEndpoint): Promise<void>;
  list(merchantId: string, mode: ApiKeyMode): Promise<WebhookEndpoint[]>;
  /** The endpoint with its secret; null if it isn't this merchant's in this mode. */
  get(merchantId: string, mode: ApiKeyMode, id: string): Promise<StoredWebhookEndpoint | null>;
  /** Changes an enabled endpoint; null if no such enabled endpoint. */
  update(
    merchantId: string,
    mode: ApiKeyMode,
    id: string,
    patch: EndpointPatch,
  ): Promise<WebhookEndpoint | null>;
  /** Stops future deliveries; returns false if no such enabled endpoint. */
  disable(merchantId: string, mode: ApiKeyMode, id: string): Promise<boolean>;
}

/** The outbox. `claimDue` leases rows so concurrent workers don't double-send. */
export interface DeliveryStore {
  claimDue(limit: number, now: Date): Promise<DueDelivery[]>;
  markSucceeded(id: string, statusCode: number, now: Date): Promise<void>;
  markFailed(id: string, failure: DeliveryFailure): Promise<void>;
  /** The endpoint's most recent deliveries, newest first. */
  listForEndpoint(endpointId: string, limit: number): Promise<WebhookDelivery[]>;
  /** Queues one of the endpoint's deliveries to go out now; false if it has none by that id. */
  retryNow(endpointId: string, deliveryId: string, now: Date): Promise<boolean>;
}
