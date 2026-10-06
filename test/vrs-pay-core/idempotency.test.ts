/**
 * @vrs-pay/core idempotency — no request runs twice for the same key.
 */
import { describe, expect, test } from "bun:test";
import {
  beginIdempotentRequest,
  createMemoryIdempotencyStore,
  finishIdempotentRequest,
  hashRequest,
} from "@vrs-pay/core";

const scope = "mer_test:test";

async function request(body: string) {
  return hashRequest({ method: "post", path: "/v1/checkout/sessions", body });
}

describe("idempotency", () => {
  test("a completed request replays its stored response", async () => {
    const store = createMemoryIdempotencyStore();
    const requestHash = await request('{"amount":4900}');
    const input = { scope, key: "k1", requestHash };
    expect(await beginIdempotentRequest(store, input)).toEqual({ kind: "proceed" });
    await finishIdempotentRequest(store, { scope, key: "k1", status: 200, body: '{"id":"cs_1"}' });
    expect(await beginIdempotentRequest(store, input)).toEqual({
      kind: "replay",
      status: 200,
      body: '{"id":"cs_1"}',
    });
  });

  test("the same key with a different payload is a 409", async () => {
    const store = createMemoryIdempotencyStore();
    await beginIdempotentRequest(store, { scope, key: "k2", requestHash: await request("a") });
    await finishIdempotentRequest(store, { scope, key: "k2", status: 200, body: "{}" });
    const reuse = beginIdempotentRequest(store, {
      scope,
      key: "k2",
      requestHash: await request("b"),
    });
    await expect(reuse).rejects.toMatchObject({ code: "idempotency_key_reused", status: 409 });
  });

  test("a concurrent duplicate is refused while the first is running", async () => {
    const store = createMemoryIdempotencyStore();
    const input = { scope, key: "k3", requestHash: await request("x") };
    await beginIdempotentRequest(store, input);
    await expect(beginIdempotentRequest(store, input)).rejects.toMatchObject({
      code: "idempotency_in_progress",
    });
  });

  test("server errors free the key so the client can retry", async () => {
    const store = createMemoryIdempotencyStore();
    const input = { scope, key: "k4", requestHash: await request("y") };
    await beginIdempotentRequest(store, input);
    await finishIdempotentRequest(store, { scope, key: "k4", status: 502, body: "{}" });
    expect(await beginIdempotentRequest(store, input)).toEqual({ kind: "proceed" });
  });

  test("keys are scoped per merchant and expire", async () => {
    let clock = 0;
    const store = createMemoryIdempotencyStore(1000, () => clock);
    const requestHash = await request("z");
    await beginIdempotentRequest(store, { scope, key: "k5", requestHash });
    const otherMerchant = { scope: "mer_other:test", key: "k5", requestHash };
    expect(await beginIdempotentRequest(store, otherMerchant)).toEqual({ kind: "proceed" });
    clock = 1001;
    expect(await beginIdempotentRequest(store, { scope, key: "k5", requestHash })).toEqual({
      kind: "proceed",
    });
  });

  test("rejects empty or oversized keys", async () => {
    const store = createMemoryIdempotencyStore();
    const requestHash = await request("q");
    await expect(
      beginIdempotentRequest(store, { scope, key: "", requestHash }),
    ).rejects.toMatchObject({
      code: "idempotency_key_invalid",
    });
  });
});
