import { invalidRequest } from "@vrs-pay/core";
import type { Context } from "hono";
import type { AppEnv } from "../app.types";

/**
 * Parses the JSON body. Uses `c.req.text()` because Hono caches it — the
 * idempotency middleware has already read the same body to hash it.
 */
export async function readJson(c: Context<AppEnv>): Promise<unknown> {
  const text = await c.req.text();
  if (text.trim() === "") return {};
  try {
    return JSON.parse(text);
  } catch {
    throw invalidRequest("invalid_json", "The request body must be valid JSON.");
  }
}
