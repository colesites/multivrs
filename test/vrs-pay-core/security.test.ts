/**
 * @vrs-pay/core ids, API keys and webhook signatures.
 */
import { describe, expect, test } from "bun:test";
import {
  generateApiKey,
  hashApiKey,
  idKind,
  newId,
  parseApiKey,
  signWebhookPayload,
  verifyWebhookSignature,
} from "@vrs-pay/core";

describe("ids", () => {
  test("are prefixed, fixed-length and unique", () => {
    const id = newId("payment");
    expect(id).toMatch(/^pay_[0-9A-Za-z]{24}$/);
    expect(idKind(id)).toBe("payment");
    expect(idKind("pay_short")).toBeNull();
    expect(new Set(Array.from({ length: 500 }, () => newId("event"))).size).toBe(500);
  });
});

describe("API keys", () => {
  test("round-trip, and only the hash is meant to be stored", async () => {
    const key = await generateApiKey("secret", "test");
    expect(key.plaintext).toMatch(/^sk_test_[0-9A-Za-z]{32}$/);
    expect(parseApiKey(key.plaintext)).toEqual({ kind: "secret", mode: "test" });
    expect(key.hash).toBe(await hashApiKey(key.plaintext));
    expect(key.hash).not.toContain(key.plaintext);
    expect(key.displayPrefix.length).toBeLessThan(key.plaintext.length);
  });

  test("malformed keys are rejected", () => {
    expect(parseApiKey("sk_live_short")).toBeNull();
    expect(parseApiKey(`rk_test_${"a".repeat(32)}`)).toBeNull();
    expect(parseApiKey(`pk_live_${"a".repeat(32)}`)).toEqual({ kind: "publishable", mode: "live" });
  });
});

describe("webhook signatures", () => {
  const secret = "whsec_test";
  const payload = JSON.stringify({ type: "payment.succeeded" });

  test("verify only fresh, untampered payloads signed with the secret", async () => {
    const now = 1_790_000_000;
    const header = await signWebhookPayload(payload, secret, now);
    expect(header).toMatch(/^t=\d+,v1=[0-9a-f]{64}$/);
    expect(await verifyWebhookSignature({ payload, header, secret, now })).toBe(true);
    expect(await verifyWebhookSignature({ payload: `${payload} `, header, secret, now })).toBe(
      false,
    );
    expect(await verifyWebhookSignature({ payload, header, secret: "other", now })).toBe(false);
    expect(await verifyWebhookSignature({ payload, header, secret, now: now + 301 })).toBe(false);
    expect(await verifyWebhookSignature({ payload, header: "garbage", secret, now })).toBe(false);
    expect(await verifyWebhookSignature({ payload, header: null, secret, now })).toBe(false);
  });
});
