/**
 * vrs-pay-api — payment links: create and list them, open /l/:id (a fresh
 * checkout each time), turn them off, and see the payment land.
 */
import { describe, expect, test } from "bun:test";
import { harness } from "./harness";
import { fakeStripeApi } from "./stripe-fakes";
import { checkoutCompleted, signedStripeRequest, stripeEvent } from "./stripe-fixtures";

async function withLink() {
  const stripe = fakeStripeApi();
  const h = await harness({ stripeApi: stripe.api });
  const link = await (
    await h.call("/v1/payment_links", {
      body: { amount: 4900, currency: "gbp", description: "Pro plan" },
    })
  ).json();
  return { ...h, stripe, link };
}

describe("payment links", () => {
  test("a link has a public URL and is listed", async () => {
    const { call, link } = await withLink();
    expect(link).toMatchObject({
      object: "payment_link",
      amount: 4900,
      currency: "gbp",
      active: true,
    });
    expect(link.url).toBe(`https://api.vrs.test/l/${link.id}`);
    expect((await (await call("/v1/payment_links")).json()).data).toMatchObject([{ id: link.id }]);
  });

  test("opening it redirects to a fresh checkout on the merchant's account", async () => {
    const { app, link, stripe } = await withLink();
    const res = await app.request(`/l/${link.id}`, { method: "POST" });
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe("https://checkout.stripe.test/cs_test_1");
    const { params, options } = stripe.calls.sessions[0] ?? { params: {} };
    expect(options).not.toHaveProperty("stripeAccount");
    expect(params.metadata).toMatchObject({ vrs_payment_link: link.id });
    expect(params.success_url).toBe("https://vrs.test/paid");
    expect(params.cancel_url).toBe("https://vrs.test/paid?canceled=1");
    await app.request(`/l/${link.id}`, { method: "POST" });
    expect(stripe.calls.sessions).toHaveLength(2);
  });

  test("visiting it shows a page that posts itself; previews never start a checkout", async () => {
    const { app, link, stripe } = await withLink();
    const res = await app.request(`/l/${link.id}`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<form method="post">');
    expect(html).toContain("£49.00");
    expect(stripe.calls.sessions).toHaveLength(0);
    expect((await app.request("/l/plink_000000000000000000000000")).status).toBe(404);
  });

  test("a turned-off link refuses; unknown links 404", async () => {
    const { app, call, link } = await withLink();
    await call(`/v1/payment_links/${link.id}`, { body: { active: false } });
    const res = await app.request(`/l/${link.id}`, { method: "POST" });
    expect([res.status, (await res.json()).error.code]).toEqual([400, "payment_link_inactive"]);
    expect(
      (await app.request("/l/plink_000000000000000000000000", { method: "POST" })).status,
    ).toBe(404);
  });

  test("paying through the link records a normal payment", async () => {
    const { app, call, link, state } = await withLink();
    await app.request(`/l/${link.id}`, { method: "POST" });
    const [session] = [...state.sessions.values()];
    expect(session?.session.payment_link).toBe(link.id);
    const event = stripeEvent(
      "checkout.session.completed",
      checkoutCompleted(session?.session.provider_reference ?? "", session?.session.id ?? ""),
    );
    await app.request("/webhooks/stripe", await signedStripeRequest(event));
    const payments = (await (await call("/v1/payments")).json()).data;
    expect(payments).toMatchObject([{ amount: 4900, status: "succeeded" }]);
  });
});
