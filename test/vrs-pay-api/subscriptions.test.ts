/**
 * vrs-pay-api — starting subscriptions: checkout that saves the card,
 * activation from the webhook, trials, entitlements and payer rules.
 */
import { describe, expect, test } from "bun:test";
import { billingSetup, subscribed } from "./billing-flows";
import { checkoutCompleted, stripeEvent } from "./stripe-fixtures";

describe("subscription checkout", () => {
  test("charges the first period on the connected account and saves the card", async () => {
    const { checkout, priceOf, stripeApi } = await billingSetup();
    const session = await (await checkout(priceOf("pro"))).json();
    expect(session).toMatchObject({
      mode: "subscription",
      amount: 900,
      platform_fee: 85,
      status: "open",
    });
    expect(session.subscription).toMatch(/^sub_/);
    const { params, options } = stripeApi.calls.sessions[0] ?? { params: {} };
    expect(params).toMatchObject({ mode: "payment", customer: "cus_stripe_1" });
    expect(params.payment_intent_data).toMatchObject({
      setup_future_usage: "off_session",
      statement_descriptor_suffix: "Acme Ltd",
    });
    expect(params.payment_intent_data).not.toHaveProperty("application_fee_amount");
    expect(options).not.toHaveProperty("stripeAccount");
  });

  test("the paid webhook activates it: period, paid invoice, saved card, entitlements", async () => {
    const { call, customer, outcome, state, subscription } = await subscribed();
    expect(outcome.outcome).toBe("processed");
    expect(subscription).toMatchObject({
      status: "active",
      quantity: 1,
      cancel_at_period_end: false,
    });
    expect(
      subscription.current_period_end - subscription.current_period_start,
    ).toBeGreaterThanOrEqual(28 * 86_400);
    const [invoice] = (await (await call(`/v1/invoices?subscription=${subscription.id}`)).json())
      .data;
    expect(invoice).toMatchObject({
      status: "paid",
      total: 900,
      currency: "gbp",
      attempt_count: 1,
    });
    expect(invoice.payment).toMatch(/^pay_/);
    expect([...state.paymentMethods.values()]).toMatchObject([{ brand: "visa", last4: "4242" }]);
    const ent = await (
      await call(`/v1/entitlements?customer=${customer.id}&feature=custom_domains`)
    ).json();
    expect(ent).toMatchObject({
      plans: ["pro"],
      features: { custom_domains: true, seats: 5 },
      granted: true,
    });
    expect(state.events.map((e) => e.event.type)).toEqual([
      "payment.succeeded",
      "invoice.paid",
      "subscription.created",
      "entitlements.updated",
    ]);
  });

  test("a redelivered or repeated completion changes nothing", async () => {
    const { deliver, session, state } = await subscribed();
    const again = await deliver(
      stripeEvent(
        "checkout.session.completed",
        checkoutCompleted(session.provider_reference, session.id, 900),
      ),
    );
    expect(again.outcome).toBe("duplicate");
    expect(state.payments.size).toBe(1);
    expect(state.invoices.size).toBe(1);
  });

  test("a trial only saves the card, then the engine charges when it ends", async () => {
    const { call, cycle, session, stripeApi, subscription } = await subscribed("trial");
    expect(session.amount).toBe(0);
    expect(stripeApi.calls.sessions[0]?.params.mode).toBe("setup");
    expect(subscription.status).toBe("trialing");
    expect(subscription.trial_end - subscription.created).toBeGreaterThanOrEqual(14 * 86_400 - 5);
    await cycle(subscription.trial_end + 1);
    const after = await (await call(`/v1/subscriptions/${subscription.id}`)).json();
    expect(after).toMatchObject({ status: "active", current_period_start: subscription.trial_end });
    expect(stripeApi.calls.charges[0]?.params).toMatchObject({
      amount: 900,
      off_session: true,
      confirm: true,
      customer: "cus_stripe_1",
      payment_method: "pm_card_visa",
    });
  });

  test("org plans need an org customer; seats only on org plans", async () => {
    const { call, checkout, priceOf } = await billingSetup();
    const orgRes = await checkout(priceOf("team"));
    expect([orgRes.status, (await orgRes.json()).error.code]).toEqual([400, "payer_mismatch"]);
    const seats = await checkout(priceOf("pro"), { quantity: 3 });
    expect((await seats.json()).error.code).toBe("quantity_invalid");
    const org = await (
      await call("/v1/customers", { body: { external_id: "org_1", type: "org" } })
    ).json();
    const team = await (await checkout(priceOf("team"), { customer: org.id, quantity: 3 })).json();
    expect(team.amount).toBe(3000);
  });
});
