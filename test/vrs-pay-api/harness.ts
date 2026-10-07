import {
  createProviderRegistry,
  generateApiKey,
  type PaymentProvider,
  PROVIDER_CAPABILITIES,
  type ProviderCheckoutInput,
  type ProviderId,
} from "@vrs-pay/core";
import { createApp } from "../../apps/vrs-pay-api/src/app";
import type { AppDeps, MerchantProfile } from "../../apps/vrs-pay-api/src/app.types";
import { createStripeProvider } from "../../apps/vrs-pay-api/src/providers/stripe/stripe.provider";
import type { StripeApi } from "../../apps/vrs-pay-api/src/providers/stripe/stripe-api.types";
import { createMemoryStores } from "../../apps/vrs-pay-api/src/stores/memory";
import { WEBHOOK_SECRET } from "./stripe-fakes";

export const MERCHANT: MerchantProfile = {
  id: "mer_test",
  name: "Acme Ltd",
  enabledProviders: ["stripe", "paystack", "flutterwave"],
  providerAccounts: { stripe: "acct_1", paystack: "ACCT_1", flutterwave: "RS_1" },
  platformFeeBps: 500,
};

/** A provider that succeeds and records every checkout it was asked for. */
export function fakeProvider(id: ProviderId) {
  const calls: ProviderCheckoutInput[] = [];
  const provider: PaymentProvider = {
    id,
    capabilities: PROVIDER_CAPABILITIES[id],
    async createCheckout(input) {
      calls.push(input);
      return {
        provider: id,
        reference: `${id}_ref_${calls.length}`,
        url: `https://pay.test/${id}/${input.sessionId}`,
      };
    },
    async refund() {
      throw new Error("not used in these tests");
    },
    async parseWebhook() {
      throw new Error("not used in these tests");
    },
    async ensureCustomer() {
      throw new Error("not used in these tests");
    },
    async chargeSaved() {
      throw new Error("not used in these tests");
    },
  };
  return { provider, calls };
}

/**
 * The real app on in-memory stores, with two merchants' keys. Stripe is a
 * recording fake, or the real adapter over a fake Stripe API (`stripeApi`).
 */
export async function harness(options: { realAdapters?: boolean; stripeApi?: StripeApi } = {}) {
  const stripe = fakeProvider("stripe");
  const paystack = fakeProvider("paystack");
  const stripeProvider = options.stripeApi
    ? createStripeProvider({ api: options.stripeApi, webhookSecrets: [WEBHOOK_SECRET] })
    : stripe.provider;
  const providers = options.realAdapters
    ? createProviderRegistry()
    : createProviderRegistry({ stripe: stripeProvider, paystack: paystack.provider });
  const stores = createMemoryStores();
  const key = await generateApiKey("secret", "test");
  const otherKey = await generateApiKey("secret", "test");
  await stores.apiKeys.add({ hash: key.hash, merchant: MERCHANT });
  await stores.apiKeys.add({ hash: otherKey.hash, merchant: { ...MERCHANT, id: "mer_other" } });
  stores.state.accounts.set("stripe:acct_1", {
    merchantId: MERCHANT.id,
    mode: "test",
    status: "active",
  });
  stores.state.merchants.set(MERCHANT.id, MERCHANT);
  const deps: AppDeps = {
    ...stores,
    modes: {
      test: { providers, platformProviders: ["stripe", "paystack", "flutterwave"] },
      live: { providers, platformProviders: ["stripe", "paystack", "flutterwave"] },
    },
    urls: { api: "https://api.vrs.test", site: "https://vrs.test" },
  };
  const app = createApp(deps);

  const call = (
    path: string,
    init: { method?: string; body?: unknown; key?: string; headers?: Record<string, string> } = {},
  ) =>
    app.request(path, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers: {
        Authorization: `Bearer ${init.key ?? key.plaintext}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      body:
        init.body === undefined
          ? undefined
          : typeof init.body === "string"
            ? init.body
            : JSON.stringify(init.body),
    });

  return {
    app,
    call,
    deps,
    state: stores.state,
    key: key.plaintext,
    otherKey: otherKey.plaintext,
    stripe,
    paystack,
  };
}

export const GBP_SESSION = {
  amount: 4900,
  currency: "gbp",
  success_url: "https://shop.test/thanks",
  cancel_url: "https://shop.test/cart",
};
