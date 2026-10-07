import { SIGNATURE_HEADER, signWebhookPayload } from "@vrs-pay/core";
import type { DeliveryStore } from "../stores/webhook.store";
import type { DueDelivery } from "./webhook-endpoint.types";

/** Seconds to wait after each failed attempt; after the last, the delivery fails. */
export const RETRY_SCHEDULE_SECONDS = [60, 300, 1_800, 7_200, 18_000, 36_000, 86_400];
const REQUEST_TIMEOUT_MS = 10_000;
const BATCH_SIZE = 25;

export interface DeliveryOptions {
  fetch?: typeof fetch;
  now?: () => Date;
}

async function send(delivery: DueDelivery, now: Date, doFetch: typeof fetch) {
  const signature = await signWebhookPayload(
    delivery.payload,
    delivery.secret,
    Math.floor(now.getTime() / 1000),
  );
  return doFetch(delivery.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", [SIGNATURE_HEADER]: signature },
    body: delivery.payload,
    redirect: "manual",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

/**
 * Sends every due webhook once: 2xx succeeds, anything else is retried on
 * RETRY_SCHEDULE_SECONDS. Returns how many were attempted.
 */
export async function deliverDueWebhooks(
  deliveries: DeliveryStore,
  { fetch: doFetch = fetch, now = () => new Date() }: DeliveryOptions = {},
): Promise<number> {
  const due = await deliveries.claimDue(BATCH_SIZE, now());
  await Promise.all(
    due.map(async (delivery) => {
      const sentAt = now();
      let statusCode: number | null = null;
      let error = "";
      try {
        const response = await send(delivery, sentAt, doFetch);
        statusCode = response.status;
        if (response.ok) return deliveries.markSucceeded(delivery.id, statusCode, sentAt);
        error = `HTTP ${response.status}`;
      } catch (cause) {
        error = cause instanceof Error ? cause.message : "Request failed";
      }
      const attempts = delivery.attempts + 1;
      const wait = RETRY_SCHEDULE_SECONDS[attempts - 1];
      const nextAttemptAt = wait === undefined ? null : new Date(sentAt.getTime() + wait * 1000);
      return deliveries.markFailed(delivery.id, { attempts, nextAttemptAt, statusCode, error });
    }),
  );
  return due.length;
}

/**
 * Polls the outbox on an interval, one pass at a time. A failed pass is
 * reported and retried next tick (leased rows come back after the lease).
 * Returns a stop function.
 */
export function startDeliveryWorker(
  deliveries: DeliveryStore,
  onError: (error: unknown) => void,
  intervalMs = 5_000,
): () => void {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await deliverDueWebhooks(deliveries);
    } catch (error) {
      onError(error);
    } finally {
      running = false;
    }
  }, intervalMs);
  return () => clearInterval(timer);
}
