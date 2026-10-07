import { type ApiKeyMode, createProviderRegistry } from "@vrs-pay/core";
import type { ModeProviders } from "../app.types";
import { createStripeProvider } from "../providers/stripe/stripe.provider";
import { createStripeClient, isLiveStripeKey } from "../providers/stripe/stripe-client";

type Env = Record<string, string | undefined>;

const NO_PROVIDERS: ModeProviders = { providers: createProviderRegistry(), platformProviders: [] };

function stripeMode(secretKey: string, webhookSecrets: Array<string | undefined>): ModeProviders {
  const api = createStripeClient(secretKey);
  const secrets = webhookSecrets.filter((s): s is string => Boolean(s));
  return {
    providers: createProviderRegistry({
      stripe: createStripeProvider({ api, webhookSecrets: secrets }),
    }),
    platformProviders: ["stripe"],
  };
}

/**
 * Stripe credentials for each mode. STRIPE_TEST_SECRET_KEY and
 * STRIPE_LIVE_SECRET_KEY (each with its STRIPE_*_WEBHOOK_SECRET) set one
 * mode each; STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET fill whichever mode
 * that key belongs to. A mode without a key can't take payments.
 */
export function stripeModes(env: Env): Record<ApiKeyMode, ModeProviders> {
  const modes: Record<ApiKeyMode, ModeProviders> = { test: NO_PROVIDERS, live: NO_PROVIDERS };
  if (env.STRIPE_SECRET_KEY) {
    const mode = isLiveStripeKey(env.STRIPE_SECRET_KEY) ? "live" : "test";
    modes[mode] = stripeMode(env.STRIPE_SECRET_KEY, [
      env.STRIPE_WEBHOOK_SECRET,
      env.STRIPE_CONNECT_WEBHOOK_SECRET,
    ]);
  }
  for (const mode of ["test", "live"] as const) {
    const prefix = `STRIPE_${mode.toUpperCase()}`;
    const key = env[`${prefix}_SECRET_KEY`];
    if (!key) continue;
    if (isLiveStripeKey(key) !== (mode === "live")) {
      throw new Error(`${prefix}_SECRET_KEY must be a ${mode} key (sk_${mode}_…).`);
    }
    modes[mode] = stripeMode(key, [env[`${prefix}_WEBHOOK_SECRET`]]);
  }
  return modes;
}
