import { authenticationError, hashApiKey, parseApiKey, sha256Hex } from "@vrs-pay/core";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../app.types";
import type { ApiKeyStore } from "../stores/api-key.store";
import type { CustomerStore } from "../stores/customer.store";

const BEARER_PATTERN = /^Bearer\s+(\S+)$/i;
export const CUSTOMER_SESSION_HEADER = "VRS-Customer-Session";

/**
 * For /client, called from browsers: `Authorization: Bearer pk_…` names the
 * merchant and mode. A customer session secret (made by the merchant's
 * server) in `VRS-Customer-Session` adds who the customer is.
 */
export function authenticateClient(
  apiKeys: ApiKeyStore,
  customers: CustomerStore,
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const token = BEARER_PATTERN.exec(c.req.header("Authorization") ?? "")?.[1];
    const parsed = token ? parseApiKey(token) : null;
    if (!token || parsed?.kind !== "publishable") {
      throw authenticationError("Send your publishable key as `Authorization: Bearer pk_…`.");
    }
    const record = await apiKeys.findByHash(await hashApiKey(token));
    if (!record) throw authenticationError("Invalid API key.");
    const merchant = { ...record.merchant, mode: parsed.mode };
    c.set("merchant", merchant);
    const secret = c.req.header(CUSTOMER_SESSION_HEADER);
    const customer = secret
      ? await customers.findBySession(await sha256Hex(secret), new Date())
      : null;
    if (secret && (customer?.merchantId !== merchant.id || customer.mode !== merchant.mode)) {
      throw authenticationError("This customer session has expired. Ask your server for a new one.");
    }
    c.set("customer", customer);
    await next();
  };
}
