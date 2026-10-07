import { createProviderRegistry, generateApiKey, newId } from "@vrs-pay/core";
import { createApp } from "../../apps/vrs-pay-api/src/app";
import type { AppDeps } from "../../apps/vrs-pay-api/src/app.types";
import { createDb } from "../../apps/vrs-pay-api/src/db/client";
import { createStripeProvider } from "../../apps/vrs-pay-api/src/providers/stripe/stripe.provider";
import { createPrismaStores } from "../../apps/vrs-pay-api/src/stores/prisma";
import { fakeStripeApi, WEBHOOK_SECRET } from "./stripe-fakes";

/** Opt-in: a migrated Postgres to run the real Prisma stores against. */
export const DATABASE_URL = process.env.VRS_TEST_DATABASE_URL;

/**
 * The app on real Prisma stores with a fake Stripe, and a fresh merchant
 * with a test secret key, so tests never see each other's rows.
 */
export async function postgresHarness(url: string) {
  const db = createDb(url);
  const stripe = fakeStripeApi({ prefix: `${crypto.randomUUID().slice(0, 8)}_` });
  const stripeProvider = createStripeProvider({
    api: stripe.api,
    webhookSecrets: [WEBHOOK_SECRET],
  });
  const providers = createProviderRegistry({ stripe: stripeProvider });
  const deps: AppDeps = {
    ...createPrismaStores(db),
    modes: {
      test: { providers, platformProviders: ["stripe"] },
      live: { providers, platformProviders: ["stripe"] },
    },
    urls: { api: "https://api.vrs.test", site: "https://vrs.test" },
  };
  const merchantId = newId("merchant");
  const key = await generateApiKey("secret", "test");
  await db.merchant.create({
    data: {
      id: merchantId,
      name: "Postgres test",
      email: "pg@vrs.test",
      apiKeys: {
        create: {
          id: newId("apiKey"),
          mode: "test",
          kind: "secret",
          hash: key.hash,
          displayPrefix: key.displayPrefix,
        },
      },
    },
  });
  const app = createApp(deps);
  const call = (path: string, init: { method?: string; body?: unknown } = {}) =>
    app.request(path, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers: { Authorization: `Bearer ${key.plaintext}`, "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  return { app, call, db, deps, merchantId, stripe, close: () => db.$disconnect() };
}
