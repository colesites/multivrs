/**
 * vrs-pay-api — products like Stripe's: a name, a description and prices.
 * Dashboard products live beside config plans without either touching the
 * other, and payment links sell a product's one-time price.
 */
import { describe, expect, test } from "bun:test";
import { createApp } from "../../apps/vrs-pay-api/src/app";
import { harness } from "./harness";
import { fakeStripeApi } from "./stripe-fakes";

const EBOOK = {
  name: "Design e-book",
  description: "120 pages on product design",
  prices: [
    { amount: 2500, currency: "usd" },
    { amount: 900, currency: "usd", interval: "month" },
  ],
};

async function withProduct() {
  const stripe = fakeStripeApi();
  const h = await harness({ stripeApi: stripe.api });
  const product = await (await h.call("/v1/products", { body: EBOOK })).json();
  const [oneTime, monthly] = product.prices;
  return { ...h, stripe, product, oneTime, monthly };
}

describe("products", () => {
  test("a product has a name, description and prices", async () => {
    const { call, product } = await withProduct();
    expect(product).toMatchObject({
      object: "product",
      name: "Design e-book",
      description: "120 pages on product design",
      active: true,
      source: "dashboard",
      prices: [
        { object: "price", amount: 2500, currency: "usd", interval: "one_time", active: true },
        { amount: 900, interval: "month" },
      ],
    });
    expect(product.id).toMatch(/^prod_/);
    expect(product.prices[0].product).toBe(product.id);
    expect((await (await call("/v1/products")).json()).data).toMatchObject([{ id: product.id }]);
    const missing = await call("/v1/products", { body: { name: "No price", prices: [] } });
    expect(missing.status).toBe(400);
  });

  test("prices are added and archived, never edited; products can be renamed and archived", async () => {
    const { call, product, oneTime } = await withProduct();
    const added = await (
      await call("/v1/prices", { body: { product: product.id, amount: 3000, currency: "gbp" } })
    ).json();
    expect(added).toMatchObject({ product: product.id, amount: 3000, currency: "gbp" });
    const archived = await (
      await call(`/v1/prices/${oneTime.id}`, { body: { active: false } })
    ).json();
    expect(archived.active).toBe(false);
    await call(`/v1/prices/${oneTime.id}`, { body: { active: true } });
    expect((await (await call(`/v1/prices/${oneTime.id}`)).json()).active).toBe(true);
    const renamed = await (
      await call(`/v1/products/${product.id}`, { body: { name: "E-book", active: false } })
    ).json();
    expect(renamed).toMatchObject({ name: "E-book", active: false });
    expect(renamed.prices).toHaveLength(3);
    expect((await (await call("/v1/products?active=true")).json()).data).toEqual([]);
  });

  test("a product can sell several prices at once, even in one currency and period", async () => {
    const { call, product } = await withProduct();
    const extra = await (
      await call("/v1/prices", { body: { product: product.id, amount: 3500, currency: "usd" } })
    ).json();
    const ngn = await call("/v1/prices", {
      body: { product: product.id, amount: 1_500_000, currency: "ngn", interval: "year" },
    });
    expect(ngn.status).toBe(200);
    const { prices } = await (await call(`/v1/products/${product.id}`)).json();
    expect(prices.filter((p: { active: boolean }) => p.active)).toHaveLength(4);
    expect(prices.find((p: { id: string }) => p.id === extra.id).active).toBe(true);
    const many = await call("/v1/products", {
      body: { name: "Bundle", prices: [EBOOK.prices[0], EBOOK.prices[0], EBOOK.prices[1]] },
    });
    expect((await many.json()).prices).toHaveLength(3);
  });

  test("prices must be in a currency VRS Pay can charge", async () => {
    const h = await harness();
    const stripeOnly = { ...h.deps.modes.test, platformProviders: ["stripe" as const] };
    const app = createApp({ ...h.deps, modes: { test: stripeOnly, live: stripeOnly } });
    const res = await app.request("/v1/products", {
      method: "POST",
      headers: { Authorization: `Bearer ${h.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Naira e-book", prices: [{ amount: 500000, currency: "ngn" }] }),
    });
    expect((await res.json()).error).toMatchObject({
      code: "currency_unsupported",
      param: "currency",
    });
  });

  test("a config sync leaves dashboard products alone, and config products stay read-only here", async () => {
    const { call, product } = await withProduct();
    const sync = await call("/v1/billing/sync", {
      body: { plans: { pro: { name: "Pro", prices: { month: { usd: 1900 } } } } },
    });
    expect((await sync.json()).plans.map((p: { key: string }) => p.key)).toEqual(["pro"]);
    await call("/v1/billing/sync", { body: { plans: {} } });
    expect((await (await call(`/v1/products/${product.id}`)).json()).active).toBe(true);
    expect((await (await call("/v1/plans?include_inactive=true")).json()).data).toHaveLength(1);
    const [, pro] = (await (await call("/v1/products")).json()).data;
    expect(pro).toMatchObject({ source: "config", active: false });
    const edit = await call(`/v1/products/${pro.id}`, { body: { name: "Hacked" } });
    expect((await edit.json()).error.code).toBe("product_managed_by_config");
  });
});

describe("payment links for a product", () => {
  test("a link sells a one-time price, named after the product", async () => {
    const { app, call, oneTime, stripe } = await withProduct();
    const link = await (await call("/v1/payment_links", { body: { price: oneTime.id } })).json();
    expect(link).toMatchObject({
      price: oneTime.id,
      amount: 2500,
      currency: "usd",
      description: "Design e-book",
    });
    expect((await app.request(`/l/${link.id}`)).status).toBe(303);
    const [created] = stripe.calls.sessions;
    expect(created?.params.line_items?.[0]?.price_data?.unit_amount).toBe(2500);
  });

  test("a monthly price makes a subscription link: a new customer subscribes at checkout", async () => {
    const { app, call, monthly, state, stripe } = await withProduct();
    const link = await (await call("/v1/payment_links", { body: { price: monthly.id } })).json();
    expect(link).toMatchObject({ interval: "month", amount: 900, description: "Design e-book" });
    expect((await app.request(`/l/${link.id}`)).status).toBe(303);
    const [session] = [...state.sessions.values()];
    expect(session?.session).toMatchObject({ mode: "subscription", payment_link: link.id });
    expect(stripe.calls.sessions[0]?.params.payment_intent_data).toMatchObject({
      setup_future_usage: "off_session",
    });
    const customers = (await (await call("/v1/customers")).json()).data;
    expect(customers).toMatchObject([{ id: session?.session.customer, email: null }]);
  });

  test("mixed bodies and archived products are refused", async () => {
    const { app, call, oneTime, product } = await withProduct();
    const mixed = await call("/v1/payment_links", { body: { price: oneTime.id, amount: 100 } });
    expect(mixed.status).toBe(400);
    const link = await (await call("/v1/payment_links", { body: { price: oneTime.id } })).json();
    await call(`/v1/products/${product.id}`, { body: { active: false } });
    const res = await app.request(`/l/${link.id}`);
    expect([res.status, (await res.json()).error.code]).toEqual([400, "price_inactive"]);
  });
});
