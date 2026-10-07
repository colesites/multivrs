import type { DeliveryStore, WebhookEndpointStore } from "../webhook.store";
import type { MemoryState } from "./state";

/** How long a claimed delivery stays leased before another worker may retry it. */
const LEASE_MS = 5 * 60 * 1000;

export function createMemoryWebhookEndpointStore(state: MemoryState): WebhookEndpointStore {
  return {
    async create(record) {
      state.endpoints.set(record.endpoint.id, record);
    },
    async list(merchantId, mode) {
      return [...state.endpoints.values()]
        .filter((r) => r.merchantId === merchantId && r.mode === mode)
        .map((r) => r.endpoint);
    },
    async disable(merchantId, mode, id) {
      const record = state.endpoints.get(id);
      const owned = record?.merchantId === merchantId && record.mode === mode;
      if (!record || !owned || record.endpoint.status !== "enabled") return false;
      state.endpoints.set(id, { ...record, endpoint: { ...record.endpoint, status: "disabled" } });
      return true;
    },
  };
}

export function createMemoryDeliveryStore(state: MemoryState): DeliveryStore {
  return {
    async claimDue(limit, now) {
      const due = [...state.deliveries.values()]
        .filter((d) => d.status === "pending" && d.nextAttemptAt <= now)
        .sort((a, b) => a.nextAttemptAt.getTime() - b.nextAttemptAt.getTime())
        .slice(0, limit);
      return due.flatMap((d) => {
        const endpoint = state.endpoints.get(d.endpointId);
        const event = state.events.find((e) => e.event.id === d.eventId);
        if (!endpoint || !event) return [];
        d.nextAttemptAt = new Date(now.getTime() + LEASE_MS);
        return [
          {
            id: d.id,
            attempts: d.attempts,
            url: endpoint.endpoint.url,
            secret: endpoint.secret,
            payload: JSON.stringify(event.event),
          },
        ];
      });
    },
    async markSucceeded(id, statusCode) {
      const d = state.deliveries.get(id);
      if (d)
        Object.assign(d, {
          status: "succeeded",
          attempts: d.attempts + 1,
          lastStatusCode: statusCode,
        });
    },
    async markFailed(id, failure) {
      const d = state.deliveries.get(id);
      if (!d) return;
      Object.assign(d, {
        status: failure.nextAttemptAt ? "pending" : "failed",
        attempts: failure.attempts,
        nextAttemptAt: failure.nextAttemptAt ?? d.nextAttemptAt,
        lastStatusCode: failure.statusCode,
        lastError: failure.error,
      });
    },
  };
}
