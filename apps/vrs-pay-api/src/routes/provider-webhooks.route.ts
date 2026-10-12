import { type ApiKeyMode, invalidRequest } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { handleProviderEvent } from "../services/provider-event.service";

const MODES: readonly ApiKeyMode[] = ["test", "live"];

/** Test and live events come from different Stripe endpoints: whichever secret signs it wins. */
async function parseStripe(deps: AppDeps, rawBody: string, headers: Headers) {
  const modes = MODES.filter((m) => deps.modes[m].platformProviders.includes("stripe"));
  let failure: unknown = null;
  for (const mode of modes.length > 0 ? modes : MODES) {
    try {
      return await deps.modes[mode].providers.stripe.parseWebhook({ rawBody, headers });
    } catch (error) {
      failure ??= error;
    }
  }
  throw failure;
}

/** Test and live Paystack sign with their own secret keys: whichever verifies wins. */
async function parsePaystack(deps: AppDeps, rawBody: string, headers: Headers) {
  const modes = MODES.filter((m) => deps.modes[m].platformProviders.includes("paystack"));
  if (modes.length === 0) throw invalidRequest("provider_disabled", "Paystack isn't set up.");
  let failure: unknown = null;
  for (const mode of modes) {
    try {
      return await deps.modes[mode].providers.paystack.parseWebhook({ rawBody, headers });
    } catch (error) {
      failure ??= error;
    }
  }
  throw failure;
}

/**
 * `/webhooks/:provider` — inbound provider webhooks. No API key: each is
 * verified by its provider signature. A 5xx makes the provider retry.
 */
export function providerWebhookRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .post("/stripe", async (c) => {
      const event = await parseStripe(deps, await c.req.text(), c.req.raw.headers);
      const outcome = await handleProviderEvent(deps, event);
      return c.json({ received: true, outcome });
    })
    .post("/paystack", async (c) => {
      const event = await parsePaystack(deps, await c.req.text(), c.req.raw.headers);
      const outcome = await handleProviderEvent(deps, event);
      return c.json({ received: true, outcome });
    });
}
