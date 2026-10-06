import {
  createMemoryIdempotencyStore,
  createProviderRegistry,
  generateApiKey,
  type PaymentProvider,
  PROVIDER_CAPABILITIES,
  type ProviderCheckoutInput,
  type ProviderId,
} from "@vrs-pay/core";
import { createApp } from "../../apps/vrs-pay-api/src/app";
import type { MerchantProfile } from "../../apps/vrs-pay-api/src/app.types";
import { createMemoryApiKeyStore } from "../../apps/vrs-pay-api/src/stores/api-key.store";
import { createMemoryCheckoutSessionStore } from "../../apps/vrs-pay-api/src/stores/checkout-session.store";

export const MERCHANT: MerchantProfile = {
  id: "mer_test",
  enabledProviders: ["stripe", "paystack", "flutterwave"],
  providerAccounts: { stripe: "acct_1", paystack: "ACCT_1", flutterwave: "RS_1" },
  platformFeeBps: 150,
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
  };
  return { provider, calls };
}

/** The real app, in-memory stores, fake Stripe + Paystack, and two merchants' keys. */
export async function harness(options: { realAdapters?: boolean } = {}) {
  const stripe = fakeProvider("stripe");
  const paystack = fakeProvider("paystack");
  const providers = options.realAdapters
    ? createProviderRegistry()
    : createProviderRegistry({ stripe: stripe.provider, paystack: paystack.provider });
  const apiKeys = createMemoryApiKeyStore();
  const key = await generateApiKey("secret", "test");
  const otherKey = await generateApiKey("secret", "test");
  await apiKeys.add({ hash: key.hash, merchant: MERCHANT });
  await apiKeys.add({ hash: otherKey.hash, merchant: { ...MERCHANT, id: "mer_other" } });
  const app = createApp({
    apiKeys,
    idempotency: createMemoryIdempotencyStore(),
    checkoutSessions: createMemoryCheckoutSessionStore(),
    providers,
  });

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

  return { app, call, key: key.plaintext, otherKey: otherKey.plaintext, stripe, paystack };
}

export const GBP_SESSION = {
  amount: 4900,
  currency: "gbp",
  success_url: "https://shop.test/thanks",
  cancel_url: "https://shop.test/cart",
};
