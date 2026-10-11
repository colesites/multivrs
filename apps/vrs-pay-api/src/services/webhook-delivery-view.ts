import type { WebhookDelivery } from "./webhook-endpoint.types";

export interface DeliveryFields {
  id: string;
  eventId: string;
  eventType: string;
  status: WebhookDelivery["status"];
  attempts: number;
  lastStatusCode: number | null;
  lastError: string | null;
  nextAttemptAt: Date;
  deliveredAt: Date | null;
  createdAt: Date;
}

const unix = (date: Date) => Math.floor(date.getTime() / 1000);

/** A stored delivery in its public shape. */
export function deliveryView(d: DeliveryFields): WebhookDelivery {
  return {
    id: d.id,
    object: "webhook_delivery",
    event: d.eventId,
    event_type: d.eventType,
    status: d.status,
    attempts: d.attempts,
    last_status_code: d.lastStatusCode,
    last_error: d.lastError,
    next_attempt: d.status === "pending" ? unix(d.nextAttemptAt) : null,
    delivered: d.deliveredAt ? unix(d.deliveredAt) : null,
    created: unix(d.createdAt),
  };
}
