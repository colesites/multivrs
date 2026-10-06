import {
  beginIdempotentRequest,
  finishIdempotentRequest,
  hashRequest,
  IDEMPOTENCY_KEY_HEADER,
  type IdempotencyStore,
} from "@vrs-pay/core";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../app.types";
import { REPLAYED_HEADER } from "../constants";

/**
 * Honours `Idempotency-Key` on POSTs: a retry with the same key and body
 * replays the first response instead of running (and charging) twice.
 */
export function idempotency(store: IdempotencyStore): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const key = c.req.header(IDEMPOTENCY_KEY_HEADER);
    if (c.req.method !== "POST" || key === undefined) {
      await next();
      return;
    }

    const merchant = c.get("merchant");
    const scope = `${merchant.id}:${merchant.mode}`;
    const requestHash = await hashRequest({
      method: c.req.method,
      path: c.req.path,
      body: await c.req.text(),
    });
    const decision = await beginIdempotentRequest(store, { scope, key, requestHash });
    if (decision.kind === "replay") {
      return new Response(decision.body, {
        status: decision.status,
        headers: { "Content-Type": "application/json", [REPLAYED_HEADER]: "true" },
      });
    }

    try {
      await next();
    } catch (error) {
      await store.release(scope, key);
      throw error;
    }
    await finishIdempotentRequest(store, {
      scope,
      key,
      status: c.res.status,
      body: await c.res.clone().text(),
    });
  };
}
