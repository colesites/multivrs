import { z } from "zod";
import { EVENT_TYPES } from "../services/event.types";

const MAX_ENABLED_EVENTS = EVENT_TYPES.length + 1;

// Merchants receive webhooks over HTTPS only (localhost allowed for testing).
const WebhookUrlSchema = z.url({ protocol: /^https?$/ }).refine(
  (value) => {
    const { protocol, hostname } = new URL(value);
    return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";
  },
  { message: "Webhook URLs must use https (http is allowed for localhost)." },
);

const EnabledEventsSchema = z
  .array(z.enum(["*", ...EVENT_TYPES]))
  .min(1)
  .max(MAX_ENABLED_EVENTS);

/** `POST /v1/webhook_endpoints` body. */
export const CreateWebhookEndpointSchema = z.strictObject({
  url: WebhookUrlSchema,
  enabled_events: EnabledEventsSchema.default(["*"]),
});

/** `PATCH /v1/webhook_endpoints/:id` body: change the URL, the events, or both. */
export const UpdateWebhookEndpointSchema = z
  .strictObject({
    url: WebhookUrlSchema.optional(),
    enabled_events: EnabledEventsSchema.optional(),
  })
  .refine((input) => input.url !== undefined || input.enabled_events !== undefined, {
    message: "Send url, enabled_events or both.",
  });

export type CreateWebhookEndpointInput = z.infer<typeof CreateWebhookEndpointSchema>;
export type UpdateWebhookEndpointInput = z.infer<typeof UpdateWebhookEndpointSchema>;
