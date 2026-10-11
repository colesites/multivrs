/**
 * vrs-pay-api — tax on top of prices (Stripe Tax): priced at checkout from
 * the buyer's address, recorded on the payment and owed in the ledger,
 * given back in proportion on refunds, and added to renewals.
 */
import { describe, expect, test } from "bun:test";
import { computeBalances, creditBalance, debitBalance } from "@vrs-pay/core";
import { subscribed } from "./billing-flows";
import { GBP_SESSION, harness } from "./harness";
import { type FakeStripeOptions, fakeStripeApi } from "./stripe-fakes";
import { paymentIntentCompleted, signedStripeRequest, stripeEvent } from "./stripe-fixtures";

const GB = { country: "gb", postal_code: "SW1A 1AA" };
const MERCHANT = { kind: "merchant_balance", owner: "mer_test" } as const;
const TAX = { kind: "tax_payable", owner: "vrs_pay" } as const;

async function taxedCheckout(options: FakeStripeOptions = {}, taxOn = true) {
  const stripe = fakeStripeApi(options);
  const h = await harness({ stripeApi: stripe.api });
  h.deps.modes.test = { ...h.deps.modes.test, tax: taxOn };
  const session = await (await h.call("/v1/checkout/sessions", { body: GBP_SESSION })).json();
  const quote = (address: object = GB) =>
    h.app.request(`/l/session/${session.id}/tax`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
  const pay = async () => {
    const intent = await stripe.api.paymentIntents.retrieve(session.provider_reference);
    const paid = {
      ...paymentIntentCompleted(session.provider_reference, session.id, intent.amount),
      metadata: { ...intent.metadata, vrs_session_id: session.id },
    };
    const event = stripeEvent("payment_intent.succeeded", paid);
    return (await h.app.request("/webhooks/stripe", await signedStripeRequest(event))).json();
  };
  const balances = () => computeBalances(h.state.ledger.map((p) => p.transaction));
  return { ...h, stripe, session, quote, pay, balances };
}

describe("tax at checkout", () => {
  test("is off unless switched on for the mode", async () => {
    const { app, quote, session } = await taxedCheckout({}, false);
    const page = await (await app.request(`/l/session/${session.id}`)).json();
    expect(page.tax_enabled).toBe(false);
    const res = await quote();
    expect([res.status, (await res.json()).error.code]).toEqual([400, "tax_disabled"]);
  });

  test("the buyer's address prices the tax and puts it on the PaymentIntent", async () => {
    const { app, quote, session, stripe } = await taxedCheckout();
    expect((await (await app.request(`/l/session/${session.id}`)).json()).tax_enabled).toBe(true);
    expect(await (await quote()).json()).toEqual({
      object: "checkout_tax",
      currency: "gbp",
      subtotal: 4900,
      tax: 980,
      total: 5880,
    });
    expect(stripe.calls.taxCalculations[0]).toMatchObject({
      currency: "gbp",
      line_items: [{ amount: 4900, reference: session.id, tax_behavior: "exclusive" }],
      customer_details: { address: { country: "GB", postal_code: "SW1A 1AA" } },
    });
    expect(stripe.calls.intentUpdates[0]).toMatchObject({
      id: session.provider_reference,
      params: {
        amount: 5880,
        metadata: { vrs_tax_calculation: "taxcalc_1", vrs_tax_amount: "980" },
      },
    });
  });

  test("an address Stripe Tax can't place, or a malformed one, is a 400", async () => {
    const bad = await taxedCheckout({ taxLocationInvalid: true });
    const res = await bad.quote();
    expect([res.status, (await res.json()).error.code]).toEqual([400, "tax_location_invalid"]);
    const { quote } = await taxedCheckout();
    expect((await quote({ country: "Britain" })).status).toBe(400);
  });

  test("paying records the tax on the payment and owes it, not the merchant", async () => {
    const { call, pay, quote, stripe, balances } = await taxedCheckout();
    await quote();
    expect((await pay()).outcome).toBe("processed");
    const [payment] = (await (await call("/v1/payments")).json()).data;
    expect(payment).toMatchObject({ amount: 5880, amount_tax: 980, platform_fee: 285 });
    // The merchant gets their price less our fee; the tax is ours to pay over.
    expect(creditBalance(balances(), MERCHANT, "GBP")).toBe(4900 - 285);
    expect(creditBalance(balances(), TAX, "GBP")).toBe(980);
    expect(stripe.calls.taxTransactions).toEqual([
      { calculation: "taxcalc_1", reference: payment.provider_reference },
    ]);
  });

  test("zero tax (no registration there) isn't recorded with Stripe Tax", async () => {
    const { call, pay, quote, stripe } = await taxedCheckout({ taxRate: 0 });
    expect((await (await quote()).json()).tax).toBe(0);
    await pay();
    const [payment] = (await (await call("/v1/payments")).json()).data;
    expect(payment).toMatchObject({ amount: 4900, amount_tax: 0 });
    expect(stripe.calls.taxTransactions).toEqual([]);
  });

  test("refunds give back their share of tax, exactly in total", async () => {
    const { call, pay, quote, stripe, balances, state } = await taxedCheckout();
    await quote();
    await pay();
    const [payment] = (await (await call("/v1/payments")).json()).data;
    const refund = (amount: number) =>
      call("/v1/refunds", { body: { payment: payment.id, amount } }).then((r) => r.json());
    expect(await refund(1000)).toMatchObject({ amount: 1000, amount_tax: 167 });
    expect(await refund(4880)).toMatchObject({ amount: 4880, amount_tax: 813 });
    const taxReturned = state.ledger
      .flatMap((p) => p.transaction.entries)
      .filter((e) => e.account.kind === "tax_payable" && e.direction === "debit")
      .reduce((sum, e) => sum + e.amount.amount, 0);
    expect(taxReturned).toBe(980);
    // Fully refunded: no tax owed; the merchant is out only our fee, as before tax.
    expect(Math.abs(creditBalance(balances(), TAX, "GBP"))).toBe(0);
    expect(debitBalance(balances(), MERCHANT, "GBP")).toBe(285);
    expect(stripe.calls.taxReversals.map((r) => [r.mode, r.flat_amount])).toEqual([
      ["partial", -1000],
      ["partial", -4880],
    ]);
  });
});

describe("tax on renewals", () => {
  test("renewals add tax at the saved address and put it on the invoice", async () => {
    const { call, cycle, deps, stripeApi, subscription } = await subscribed();
    deps.modes.test = { ...deps.modes.test, tax: true };
    expect(await cycle(subscription.current_period_end + 1)).toMatchObject({
      collected: ["paid"],
    });
    expect(stripeApi.calls.charges[0]?.params).toMatchObject({ amount: 1080 });
    expect(stripeApi.calls.taxCalculations[0]).toMatchObject({ customer: "cus_stripe_1" });
    const invoices = (await (await call(`/v1/invoices?subscription=${subscription.id}`)).json())
      .data;
    const renewal = invoices.find(
      (i: { billing_reason: string }) => i.billing_reason !== "subscription_create",
    );
    expect(renewal).toMatchObject({ subtotal: 900, tax: 180, total: 1080 });
    expect(renewal.lines.at(-1)).toMatchObject({ kind: "tax", amount: 180 });
    const payments = (await (await call("/v1/payments")).json()).data;
    const charged = payments.find((p: { checkout_session: string | null }) => !p.checkout_session);
    expect(charged).toMatchObject({ amount: 1080, amount_tax: 180 });
  });

  test("without an address on file the renewal still goes through, untaxed", async () => {
    const { cycle, deps, stripeApi, subscription } = await subscribed("pro", {
      taxLocationInvalid: true,
    });
    deps.modes.test = { ...deps.modes.test, tax: true };
    expect((await cycle(subscription.current_period_end + 1)).collected).toEqual(["paid"]);
    expect(stripeApi.calls.charges[0]?.params).toMatchObject({ amount: 900 });
  });
});
