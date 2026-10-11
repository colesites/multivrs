import { invalidRequest, newId, randomBase62, resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type {
  CreateWebhookEndpointInput,
  UpdateWebhookEndpointInput,
} from "../routes/webhook-endpoint.schema";
import { nowSeconds } from "./events";
import { postSignedWebhook } from "./webhook-delivery.service";
import type {
  StoredWebhookEndpoint,
  WebhookEndpoint,
  WebhookTestResult,
} from "./webhook-endpoint.types";

const SECRET_PREFIX = "whsec_";
const SECRET_LENGTH = 32;
/** How many recent deliveries the dashboard shows per endpoint. */
const DELIVERY_PAGE = 50;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Creates an endpoint. Its signing secret is returned here and never again. */
export async function createWebhookEndpoint(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreateWebhookEndpointInput,
): Promise<WebhookEndpoint> {
  const secret = `${SECRET_PREFIX}${randomBase62(SECRET_LENGTH)}`;
  const endpoint: WebhookEndpoint = {
    id: newId("webhookEndpoint"),
    object: "webhook_endpoint",
    livemode: merchant.mode === "live",
    url: input.url,
    enabled_events: [...new Set(input.enabled_events)],
    status: "enabled",
    created: nowSeconds(),
  };
  await deps.webhookEndpoints.create({
    merchantId: merchant.id,
    mode: merchant.mode,
    secret,
    endpoint,
  });
  return { ...endpoint, secret };
}

export function listWebhookEndpoints(deps: AppDeps, merchant: MerchantContext) {
  return deps.webhookEndpoints.list(merchant.id, merchant.mode);
}

export async function disableWebhookEndpoint(deps: AppDeps, merchant: MerchantContext, id: string) {
  if (!(await deps.webhookEndpoints.disable(merchant.id, merchant.mode, id))) {
    throw resourceMissing("webhook endpoint", id);
  }
  return { id, object: "webhook_endpoint" as const, deleted: true };
}

export async function updateWebhookEndpoint(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
  input: UpdateWebhookEndpointInput,
): Promise<WebhookEndpoint> {
  const updated = await deps.webhookEndpoints.update(merchant.id, merchant.mode, id, {
    url: input.url,
    enabledEvents: input.enabled_events && [...new Set(input.enabled_events)],
  });
  if (!updated) throw resourceMissing("webhook endpoint", id);
  return updated;
}

async function enabledEndpoint(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
): Promise<StoredWebhookEndpoint> {
  const record = await deps.webhookEndpoints.get(merchant.id, merchant.mode, id);
  if (!record) throw resourceMissing("webhook endpoint", id);
  if (record.endpoint.status !== "enabled") {
    throw invalidRequest("endpoint_disabled", "This webhook endpoint has been removed.");
  }
  return record;
}

export async function listEndpointDeliveries(deps: AppDeps, merchant: MerchantContext, id: string) {
  const record = await deps.webhookEndpoints.get(merchant.id, merchant.mode, id);
  if (!record) throw resourceMissing("webhook endpoint", id);
  return deps.deliveries.listForEndpoint(id, DELIVERY_PAGE);
}

/** Sends a delivery again now, whether it failed, succeeded or is still waiting. */
export async function retryDelivery(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
  deliveryId: string,
  now = new Date(),
) {
  await enabledEndpoint(deps, merchant, id);
  if (!UUID.test(deliveryId) || !(await deps.deliveries.retryNow(id, deliveryId, now))) {
    throw resourceMissing("webhook delivery", deliveryId);
  }
  return { id: deliveryId, object: "webhook_delivery" as const, status: "pending" as const };
}

/**
 * Sends a signed `webhook.test` event straight away and reports the result.
 * Nothing is stored, and no real event type is used, so a handler can't
 * mistake it for a payment.
 */
export async function sendTestWebhook(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
  doFetch: typeof fetch = fetch,
): Promise<WebhookTestResult> {
  const { endpoint, secret } = await enabledEndpoint(deps, merchant, id);
  const payload = JSON.stringify({
    id: newId("event"),
    object: "event",
    type: "webhook.test",
    livemode: endpoint.livemode,
    created: nowSeconds(),
    data: { object: { object: "webhook_endpoint", id: endpoint.id, url: endpoint.url } },
  });
  try {
    const response = await postSignedWebhook(endpoint.url, secret, payload, new Date(), doFetch);
    await response.body?.cancel();
    return {
      object: "webhook_test",
      ok: response.ok,
      status_code: response.status,
      error: response.ok ? null : `HTTP ${response.status}`,
    };
  } catch (cause) {
    return {
      object: "webhook_test",
      ok: false,
      status_code: null,
      error: cause instanceof Error ? cause.message : "Request failed",
    };
  }
}
