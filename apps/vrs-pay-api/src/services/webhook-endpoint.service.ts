import { newId, randomBase62, resourceMissing } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type { CreateWebhookEndpointInput } from "../routes/webhook-endpoint.schema";
import { nowSeconds } from "./events";
import type { WebhookEndpoint } from "./webhook-endpoint.types";

const SECRET_PREFIX = "whsec_";
const SECRET_LENGTH = 32;

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
