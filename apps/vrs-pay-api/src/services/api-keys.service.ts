import {
  type ApiKeyKind,
  type ApiKeyMode,
  generateApiKey,
  invalidRequest,
  newId,
  resourceMissing,
} from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { ApiKeySummary } from "../stores/merchant.store";

/** A key as returned when it's made: the whole secret, this once. */
export type CreatedApiKey = ApiKeySummary & { secret: string };

const DEFAULT_NAME = "Default";

/**
 * Makes a key. Publishable keys are kept readable (they're public); test
 * secret keys are sealed so they can be shown again; live secret keys are
 * shown now and never again.
 */
export async function createApiKey(
  deps: AppDeps,
  merchantId: string,
  mode: ApiKeyMode,
  kind: ApiKeyKind,
  name: string | null,
): Promise<CreatedApiKey> {
  const key = await generateApiKey(kind, mode);
  const id = newId("apiKey");
  const sealedSecret =
    kind === "secret" && mode === "test" && deps.sealer
      ? await deps.sealer.seal(key.plaintext)
      : null;
  await deps.merchants.addKey(merchantId, {
    id,
    mode,
    kind,
    hash: key.hash,
    displayPrefix: key.displayPrefix,
    name,
    plaintext: kind === "publishable" ? key.plaintext : null,
    sealedSecret,
  });
  return {
    id,
    object: "api_key",
    kind,
    livemode: mode === "live",
    display_prefix: key.displayPrefix,
    name,
    token: kind === "publishable" ? key.plaintext : null,
    revealable: sealedSecret !== null,
    last_used: null,
    created: Math.floor(Date.now() / 1000),
    revoked: false,
    secret: key.plaintext,
  };
}

/**
 * A new account starts with a test publishable key and a test secret key,
 * so the quickstart works straight away. Only in test mode, and only when
 * the account has no working keys there yet.
 */
export async function ensureDefaultKeys(deps: AppDeps, merchantId: string, mode: ApiKeyMode) {
  if (mode !== "test") return;
  const keys = await deps.merchants.listKeys(merchantId, mode);
  if (keys.length > 0) return;
  await createApiKey(deps, merchantId, mode, "publishable", DEFAULT_NAME);
  await createApiKey(deps, merchantId, mode, "secret", DEFAULT_NAME);
}

/** Shows a test secret key again. Live secret keys are only ever shown when made. */
export async function revealApiKey(deps: AppDeps, merchantId: string, id: string) {
  const key = await deps.merchants.getKey(merchantId, id);
  if (!key || key.revoked) throw resourceMissing("api key", id);
  if (key.kind !== "secret")
    throw invalidRequest("not_secret", "Publishable keys are always shown.");
  if (key.mode === "live") {
    throw invalidRequest(
      "live_key_hidden",
      "Live secret keys are only shown when created. Roll the key to get a new one.",
    );
  }
  if (!key.sealedSecret || !deps.sealer) {
    throw invalidRequest(
      "not_revealable",
      "This key can't be shown again. Roll it to get a new one.",
    );
  }
  return { id, object: "api_key" as const, secret: await deps.sealer.open(key.sealedSecret) };
}

/** Replaces a key with a new one of the same kind and name, and revokes the old one. */
export async function rollApiKey(
  deps: AppDeps,
  merchantId: string,
  id: string,
): Promise<CreatedApiKey> {
  const key = await deps.merchants.getKey(merchantId, id);
  if (!key || key.revoked) throw resourceMissing("api key", id);
  const next = await createApiKey(deps, merchantId, key.mode, key.kind, key.name);
  await deps.merchants.revokeKey(merchantId, id);
  return next;
}
