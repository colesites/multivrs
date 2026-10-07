/**
 * vrs-pay-api — what Stripe products have beyond a name and prices: a free
 * trial, features for entitlements, images, marketing features, metadata.
 */
import { describe, expect, test } from "bun:test";
import { billingSetup } from "./billing-flows";
import { setupCompleted, stripeEvent } from "./stripe-fixtures";

const POWER = {
  name: "Power",
  description: "For large teams running Present at scale",
  prices: [{ amount: 2400, currency: "usd", interval: "month" }],
  trial_days: 7,
  features: { cloud_sync: true, storage_gb: 100 },
  images: ["https://cdn.present.test/power.png"],
  marketing_features: [{ name: "100 GB cloud storage" }, { name: "Priority support" }],
  metadata: { tier: "power" },
};

describe("product extras", () => {
  test("a product keeps its trial, features, images, marketing features and metadata", async () => {
    const { call } = await billingSetup();
    const product = await (await call("/v1/products", { body: POWER })).json();
    const { prices: _, ...extras } = POWER;
    expect(product).toMatchObject(extras);
    const bare = await (
      await call("/v1/products", { body: { name: "Bare", prices: POWER.prices } })
    ).json();
    expect(bare).toMatchObject({
      trial_days: 0,
      features: {},
      images: [],
      marketing_features: [],
      metadata: {},
    });
  });

  test("updates replace a list or map whole and leave the rest alone", async () => {
    const { call } = await billingSetup();
    const product = await (await call("/v1/products", { body: POWER })).json();
    const updated = await (
      await call(`/v1/products/${product.id}`, {
        body: { features: { cloud_sync: true }, marketing_features: [] },
      })
    ).json();
    expect(updated).toMatchObject({
      features: { cloud_sync: true },
      marketing_features: [],
      trial_days: 7,
      metadata: { tier: "power" },
      images: POWER.images,
    });
    expect(updated.features).not.toHaveProperty("storage_gb");
  });

  test("bad keys, image links and feature types are refused", async () => {
    const { call } = await billingSetup();
    const bad = async (body: object) => {
      const res = await call("/v1/products", { body: { ...POWER, ...body } });
      return [res.status, (await res.json()).error.param];
    };
    expect(await bad({ features: { "Cloud Sync": true } })).toEqual([400, "features.Cloud Sync"]);
    expect(await bad({ images: ["not a url"] })).toEqual([400, "images.0"]);
    expect(await bad({ trial_days: 400 })).toEqual([400, "trial_days"]);
    // `seats` is a limit in the synced config, so a dashboard product can't make it true/false.
    expect(await bad({ features: { seats: true } })).toEqual([400, "features.seats"]);
  });

  test("subscribers get the product's trial and its features as entitlements", async () => {
    const { call, checkout, customer, deliver } = await billingSetup();
    const product = await (await call("/v1/products", { body: POWER })).json();
    const session = await (await checkout(product.prices[0].id)).json();
    expect(session.amount).toBe(0);
    await deliver(
      stripeEvent(
        "checkout.session.completed",
        setupCompleted(session.provider_reference, session.id),
      ),
    );
    const sub = await (await call(`/v1/subscriptions/${session.subscription}`)).json();
    expect(sub.status).toBe("trialing");
    expect(sub.trial_end - sub.created).toBeGreaterThanOrEqual(7 * 86_400 - 5);
    const entitlements = await (await call(`/v1/entitlements?customer=${customer.id}`)).json();
    expect(entitlements.features).toEqual({ cloud_sync: true, storage_gb: 100 });
  });
});
