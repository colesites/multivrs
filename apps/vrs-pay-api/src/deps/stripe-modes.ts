import {
  type ApiKeyMode,
  type CurrencyCode,
  CurrencyCodeSchema,
  createProviderRegistry,
} from "@vrs-pay/core";
import type { ModeProviders } from "../app.types";
import { createPaystackProvider } from "../providers/paystack/paystack.provider";
import { createPaystackClient } from "../providers/paystack/paystack-api";
import { createPaystackPayouts } from "../providers/paystack/paystack-payouts";
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

/** The platform's Stripe secret key for `mode`, by the same rules as stripeModes. */
export function platformStripeKey(env: Env, mode: ApiKeyMode): string | undefined {
  const explicit = env[`STRIPE_${mode.toUpperCase()}_SECRET_KEY`];
  if (explicit) return explicit;
  const shared = env.STRIPE_SECRET_KEY;
  return shared && isLiveStripeKey(shared) === (mode === "live") ? shared : undefined;
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

/**
 * Turns on tax for the modes listed in STRIPE_TAX ("test", "live", both
 * comma-separated, or "on" for both). Off by default: Stripe rejects tax
 * calculations until Stripe Tax is activated for that mode.
 */
export function withStripeTax(
  modes: Record<ApiKeyMode, ModeProviders>,
  setting: string | undefined,
): Record<ApiKeyMode, ModeProviders> {
  const listed = new Set((setting ?? "").split(",").map((m) => m.trim().toLowerCase()));
  const on = (mode: ApiKeyMode) => listed.has(mode) || listed.has("on");
  return {
    test: { ...modes.test, tax: on("test") },
    live: { ...modes.live, tax: on("live") },
  };
}

/** The Paystack secret key for `mode`: PAYSTACK_TEST/LIVE_SECRET_KEY, or PAYSTACK_SECRET_KEY by its prefix. */
function paystackKey(env: Env, mode: ApiKeyMode): string | undefined {
  const explicit = env[`PAYSTACK_${mode.toUpperCase()}_SECRET_KEY`];
  if (explicit) return explicit;
  const shared = env.PAYSTACK_SECRET_KEY;
  return shared?.startsWith(`sk_${mode}_`) ? shared : undefined;
}

/**
 * PAYSTACK_CURRENCIES: what the Paystack account takes, comma-separated. A
 * Paystack account takes its own country's currency (NGN for a Nigerian one,
 * plus USD once Paystack approves it), so NGN when unset.
 */
function paystackCurrencies(setting: string | undefined): CurrencyCode[] {
  const listed = (setting ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  return (listed.length > 0 ? listed : ["NGN"]).map((code) => {
    const parsed = CurrencyCodeSchema.safeParse(code);
    if (!parsed.success)
      throw new Error(`PAYSTACK_CURRENCIES: ${code} isn't a currency VRS Pay supports.`);
    return parsed.data;
  });
}

/**
 * Adds Paystack to each mode that has a Paystack secret key, for the
 * currencies in PAYSTACK_CURRENCIES (see routePayment's African preference).
 */
export function withPaystack(
  modes: Record<ApiKeyMode, ModeProviders>,
  env: Env,
): Record<ApiKeyMode, ModeProviders> {
  const next = { ...modes };
  const currencies = paystackCurrencies(env.PAYSTACK_CURRENCIES);
  for (const mode of ["test", "live"] as const) {
    const key = paystackKey(env, mode);
    if (!key) continue;
    const api = createPaystackClient(key);
    const paystack = createPaystackProvider({ api, secretKey: key });
    next[mode] = {
      ...modes[mode],
      providers: { ...modes[mode].providers, paystack },
      platformProviders: [...new Set([...modes[mode].platformProviders, "paystack" as const])],
      currencies: { ...modes[mode].currencies, paystack: currencies },
      payoutRails: { ...modes[mode].payoutRails, paystack: createPaystackPayouts(api) },
    };
  }
  return next;
}

/**
 * STRIPE_SETTLEMENT_CURRENCIES: the currencies the platform Stripe account
 * holds, comma-separated (e.g. "GBP,USD,EUR"). GBP when unset. Stripe
 * payments in other currencies are converted, and carry the conversion fee.
 */
export function settlementCurrenciesFrom(setting: string | undefined): CurrencyCode[] {
  const listed = (setting ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  if (listed.length === 0) return ["GBP"];
  return listed.map((code) => {
    const parsed = CurrencyCodeSchema.safeParse(code);
    if (!parsed.success) {
      throw new Error(`STRIPE_SETTLEMENT_CURRENCIES: ${code} isn't a currency VRS Pay supports.`);
    }
    return parsed.data;
  });
}
