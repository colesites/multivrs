/**
 * vrs-pay-api — /v1/webhook_endpoints and the outbox: signed deliveries,
 * retries with backoff, and giving up after the schedule.
 */
import { describe, expect, test } from "bun:test";
import { SIGNATURE_HEADER, verifyWebhookSignature } from "@vrs-pay/core";
import {
  deliverDueWebhooks,
  RETRY_SCHEDULE_SECONDS,
} from "../../apps/vrs-pay-api/src/services/webhook-delivery.service";
import { paidCheckout } from "./flows";
import { harness } from "./harness";

const AT = new Date("2026-10-06T12:00:00Z");

function recorder(status: number) {
  const requests: Request[] = [];
  const doFetch: typeof fetch = Object.assign(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push(new Request(input, init));
      return new Response(null, { status });
    },
    { preconnect: fetch.preconnect },
  );
  return { requests, doFetch };
}

describe("/v1/webhook_endpoints", () => {
  test("the secret is shown on create only; delete stops deliveries", async () => {
    const { call } = await harness();
    const created = await (
      await call("/v1/webhook_endpoints", { body: { url: "https://shop.test/hooks" } })
    ).json();
    expect(created).toMatchObject({
      object: "webhook_endpoint",
      enabled_events: ["*"],
      status: "enabled",
    });
    expect(created.secret).toMatch(/^whsec_[0-9A-Za-z]{32}$/);
    const list = await (await call("/v1/webhook_endpoints")).json();
    expect(list.data[0]).not.toHaveProperty("secret");
    const removed = await (
      await call(`/v1/webhook_endpoints/${created.id}`, { method: "DELETE" })
    ).json();
    expect(removed).toEqual({ id: created.id, object: "webhook_endpoint", deleted: true });
    expect((await call(`/v1/webhook_endpoints/${created.id}`, { method: "DELETE" })).status).toBe(
      404,
    );
  });

  test("plain http is refused except for localhost", async () => {
    const { call } = await harness();
    expect(
      (await call("/v1/webhook_endpoints", { body: { url: "http://shop.test/hooks" } })).status,
    ).toBe(400);
    expect(
      (await call("/v1/webhook_endpoints", { body: { url: "http://localhost:3000/hooks" } }))
        .status,
    ).toBe(200);
  });
});

describe("webhook delivery", () => {
  test("events are POSTed once with a VRS-Signature the merchant can verify", async () => {
    const { call, deliver, deps, event } = await paidCheckout();
    const { secret } = await (
      await call("/v1/webhook_endpoints", { body: { url: "https://b.test/hooks" } })
    ).json();
    await deliver(event);
    const { requests, doFetch } = recorder(200);
    expect(await deliverDueWebhooks(deps.deliveries, { fetch: doFetch, now: () => AT })).toBe(2);
    const request = requests.find((r) => r.url === "https://b.test/hooks");
    const payload = (await request?.text()) ?? "";
    const header = request?.headers.get(SIGNATURE_HEADER);
    const now = AT.getTime() / 1000;
    expect(await verifyWebhookSignature({ payload, header, secret, now })).toBe(true);
    expect(JSON.parse(payload)).toMatchObject({
      object: "event",
      type: "payment.succeeded",
      livemode: false,
    });
    expect(await deliverDueWebhooks(deps.deliveries, { fetch: doFetch, now: () => AT })).toBe(0);
  });

  test("failures retry on the schedule, then give up", async () => {
    const { deliver, deps, event, state } = await paidCheckout();
    await deliver(event);
    const { doFetch } = recorder(500);
    let now = AT;
    for (const wait of RETRY_SCHEDULE_SECONDS) {
      expect(await deliverDueWebhooks(deps.deliveries, { fetch: doFetch, now: () => now })).toBe(1);
      const [delivery] = [...state.deliveries.values()];
      expect(delivery?.nextAttemptAt.getTime()).toBe(now.getTime() + wait * 1000);
      expect(await deliverDueWebhooks(deps.deliveries, { fetch: doFetch, now: () => now })).toBe(0);
      now = new Date(now.getTime() + wait * 1000);
    }
    await deliverDueWebhooks(deps.deliveries, { fetch: doFetch, now: () => now });
    expect([...state.deliveries.values()]).toMatchObject([
      { status: "failed", attempts: RETRY_SCHEDULE_SECONDS.length + 1, lastStatusCode: 500 },
    ]);
  });
});
