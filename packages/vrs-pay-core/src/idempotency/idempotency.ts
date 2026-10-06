import { sha256Hex } from "../crypto";
import { idempotencyError, invalidRequest } from "../errors";
import type { IdempotencyDecision, IdempotencyStore } from "./idempotency.types";

export const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_IDEMPOTENCY_KEY_LENGTH = 255;

/** Fingerprint of a request, so a reused key with a different payload is caught. */
export function hashRequest(input: {
  method: string;
  path: string;
  body: string;
}): Promise<string> {
  return sha256Hex(`${input.method.toUpperCase()} ${input.path}\n${input.body}`);
}

export function assertValidIdempotencyKey(key: string): void {
  if (key.length === 0 || key.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    throw invalidRequest(
      "idempotency_key_invalid",
      `Idempotency keys must be 1–${MAX_IDEMPOTENCY_KEY_LENGTH} characters.`,
      IDEMPOTENCY_KEY_HEADER,
    );
  }
}

/**
 * Claims the key for this request. Returns `proceed` for a new key or a
 * stored response to replay; throws 409 for a reused key with a different
 * payload, or while the original request is still running.
 */
export async function beginIdempotentRequest(
  store: IdempotencyStore,
  input: { scope: string; key: string; requestHash: string },
): Promise<IdempotencyDecision> {
  assertValidIdempotencyKey(input.key);
  const existing = await store.claim(input.scope, input.key, input.requestHash);
  if (!existing) return { kind: "proceed" };
  if (existing.requestHash !== input.requestHash) {
    throw idempotencyError(
      "idempotency_key_reused",
      "This idempotency key was already used with a different request.",
    );
  }
  if (existing.state === "in_progress") {
    throw idempotencyError(
      "idempotency_in_progress",
      "A request with this idempotency key is still being processed.",
    );
  }
  return { kind: "replay", status: existing.status, body: existing.body };
}

/** Stores the response for replay; 5xx frees the key so a retry can run. */
export async function finishIdempotentRequest(
  store: IdempotencyStore,
  input: { scope: string; key: string; status: number; body: string },
): Promise<void> {
  if (input.status >= 500) {
    await store.release(input.scope, input.key);
    return;
  }
  await store.complete(input.scope, input.key, {
    status: input.status,
    body: input.body,
  });
}
