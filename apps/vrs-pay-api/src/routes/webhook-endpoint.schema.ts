import { z } from "zod";
import { EVENT_TYPES } from "../services/event.types";

const MAX_ENABLED_EVENTS = EVENT_TYPES.length + 1;

/** `POST /v1/webhook_endpoints` body. */
export const CreateWebhookEndpointSchema = z.strictObject({
  // Merchants receive webhooks over HTTPS only (localhost allowed for testing).
  url: z.url({ protocol: /^https?$/ }).refine(
    (value) => {
      const { protocol, hostname } = new URL(value);
      return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";
    },
    { message: "Webhook URLs must use https (http is allowed for localhost)." },
  ),
  enabled_events: z
    .array(z.enum(["*", ...EVENT_TYPES]))
    .min(1)
    .max(MAX_ENABLED_EVENTS)
    .default(["*"]),
});

export type CreateWebhookEndpointInput = z.infer<typeof CreateWebhookEndpointSchema>;
