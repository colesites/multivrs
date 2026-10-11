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
import { sendTestWebhook } from "../../apps/vrs-pay-api/src/services/webhook-endpoint.service";
import { paidCheckout } from "./flows";
import { harness, MERCHANT } from "./harness";

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

describe("choosing events, delivery history and test sends", () => {
  test("event_types lists every event an endpoint can subscribe to", async () => {
    const { call } = await harness();
    const { data } = await (await call("/v1/webhook_endpoints/event_types")).json();
    expect(data).toContain("payment.succeeded");
    expect(data).toContain("subscription.updated");
  });

  test("PATCH narrows an endpoint's events, and only matching events are queued", async () => {
    const { call, deliver, event, state } = await paidCheckout();
    const {
      data: [endpoint],
    } = await (await call("/v1/webhook_endpoints")).json();
    const updated = await (
      await call(`/v1/webhook_endpoints/${endpoint.id}`, {
        method: "PATCH",
        body: { enabled_events: ["refund.succeeded"] },
      })
    ).json();
    expect(updated).toMatchObject({ id: endpoint.id, enabled_events: ["refund.succeeded"] });
    await deliver(event);
    expect(state.events.map((e) => e.event.type)).toEqual(["payment.succeeded"]);
    expect(state.deliveries.size).toBe(0);
  });

  test("PATCH needs a change, and only known event types", async () => {
    const { call } = await harness();
    const endpoint = await (
      await call("/v1/webhook_endpoints", { body: { url: "https://shop.test/hooks" } })
    ).json();
    const patch = (body: object) =>
      call(`/v1/webhook_endpoints/${endpoint.id}`, { method: "PATCH", body });
    expect((await patch({})).status).toBe(400);
    expect((await patch({ enabled_events: ["payment.exploded"] })).status).toBe(400);
    expect((await patch({ url: "https://shop.test/new" })).status).toBe(200);
  });

  test("deliveries are listed, and a waiting one can be sent again now", async () => {
    const { call, deliver, deps, event } = await paidCheckout();
    await deliver(event);
    const {
      data: [endpoint],
    } = await (await call("/v1/webhook_endpoints")).json();
    await deliverDueWebhooks(deps.deliveries, { fetch: recorder(500).doFetch, now: () => AT });
    const history = async () =>
      (await (await call(`/v1/webhook_endpoints/${endpoint.id}/deliveries`)).json()).data;
    const [failed] = await history();
    expect(failed).toMatchObject({
      object: "webhook_delivery",
      event_type: "payment.succeeded",
      status: "pending",
      attempts: 1,
      last_status_code: 500,
      last_error: "HTTP 500",
      delivered: null,
    });
    const retried = await call(
      `/v1/webhook_endpoints/${endpoint.id}/deliveries/${failed.id}/retry`,
      {
        body: {},
      },
    );
    expect(await retried.json()).toEqual({
      id: failed.id,
      object: "webhook_delivery",
      status: "pending",
    });
    expect(await deliverDueWebhooks(deps.deliveries, { fetch: recorder(200).doFetch })).toBe(1);
    const [sent] = await history();
    expect(sent).toMatchObject({ status: "succeeded", attempts: 2, next_attempt: null });
    expect(typeof sent.delivered).toBe("number");
  });

  test("unknown endpoints and deliveries are 404s", async () => {
    const { call } = await paidCheckout();
    const {
      data: [endpoint],
    } = await (await call("/v1/webhook_endpoints")).json();
    expect((await call("/v1/webhook_endpoints/we_missing/deliveries")).status).toBe(404);
    expect((await call("/v1/webhook_endpoints/we_missing/test", { body: {} })).status).toBe(404);
    const retry = (id: string) =>
      call(`/v1/webhook_endpoints/${endpoint.id}/deliveries/${id}/retry`, { body: {} });
    expect((await retry("not-a-uuid")).status).toBe(404);
    expect((await retry(crypto.randomUUID())).status).toBe(404);
  });

  test("a test send posts a signed webhook.test event and stores nothing", async () => {
    const { call, deps, state } = await harness();
    const endpoint = await (
      await call("/v1/webhook_endpoints", { body: { url: "https://shop.test/hooks" } })
    ).json();
    const merchant = { ...MERCHANT, mode: "test" as const };
    const { requests, doFetch } = recorder(204);
    expect(await sendTestWebhook(deps, merchant, endpoint.id, doFetch)).toEqual({
      object: "webhook_test",
      ok: true,
      status_code: 204,
      error: null,
    });
    const payload = (await requests[0]?.text()) ?? "";
    const header = requests[0]?.headers.get(SIGNATURE_HEADER);
    const now = Math.floor(Date.now() / 1000);
    expect(await verifyWebhookSignature({ payload, header, secret: endpoint.secret, now })).toBe(
      true,
    );
    expect(JSON.parse(payload)).toMatchObject({
      type: "webhook.test",
      data: { object: { id: endpoint.id } },
    });
    expect(await sendTestWebhook(deps, merchant, endpoint.id, recorder(500).doFetch)).toMatchObject(
      { ok: false, status_code: 500, error: "HTTP 500" },
    );
    expect(state.events).toHaveLength(0);
    expect(state.deliveries.size).toBe(0);
  });
});
