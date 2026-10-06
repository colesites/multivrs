import { authenticationError, hashApiKey, parseApiKey } from "@vrs-pay/core";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../app.types";
import type { ApiKeyStore } from "../stores/api-key.store";

const BEARER_PATTERN = /^Bearer\s+(\S+)$/i;

/**
 * Resolves `Authorization: Bearer sk_…` to a merchant. The key's mode
 * (test/live) scopes everything the request can see.
 */
export function authenticate(apiKeys: ApiKeyStore): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const token = BEARER_PATTERN.exec(c.req.header("Authorization") ?? "")?.[1];
    const parsed = token ? parseApiKey(token) : null;
    if (!token || !parsed) {
      throw authenticationError("Send your secret key as `Authorization: Bearer sk_…`.");
    }
    if (parsed.kind !== "secret") {
      throw authenticationError("Publishable keys can't call this endpoint; use a secret key.");
    }
    const record = await apiKeys.findByHash(await hashApiKey(token));
    if (!record) {
      throw authenticationError("Invalid API key.");
    }
    c.set("merchant", { ...record.merchant, mode: parsed.mode });
    await next();
  };
}
