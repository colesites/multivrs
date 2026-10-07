/**
 * vrs-pay-api — POST /webhooks/stripe: a paid checkout becomes a payment,
 * a ledger posting and a queued merchant webhook, exactly once.
 */
import { describe, expect, test } from "bun:test";
import { computeBalances, creditBalance, debitBalance } from "@vrs-pay/core";
import { paidCheckout } from "./flows";
import { checkoutCompleted, signedStripeRequest, stripeEvent } from "./stripe-fixtures";

describe("POST /webhooks/stripe", () => {
  test("a paid checkout records the payment, completes the session and posts the ledger", async () => {
    const { call, deliver, event, session, state } = await paidCheckout();
    expect(await deliver(event)).toEqual({ received: true, outcome: "processed" });

    expect((await (await call(`/v1/checkout/sessions/${session.id}`)).json()).status).toBe(
      "complete",
    );
    const [stored] = [...state.payments.values()];
    const payment = await (await call(`/v1/payments/${stored?.payment.id}`)).json();
    expect(payment).toMatchObject({
      object: "payment",
      status: "succeeded",
      amount: 4900,
      currency: "gbp",
      platform_fee: 285,
      provider_fee: 94,
      provider_reference: `pi_for_${session.provider_reference}`,
      checkout_session: session.id,
      customer_email: "buyer@shop.test",
    });

    const balances = computeBalances(state.ledger.map((p) => p.transaction));
    const merchant = { kind: "merchant_balance", owner: "mer_test" } as const;
    const fees = { kind: "platform_fees", owner: "vrs_pay" } as const;
    // Charged on the platform: the merchant is owed the amount less our fee;
    // Stripe's 94 is our processing cost.
    expect(creditBalance(balances, merchant, "GBP")).toBe(4900 - 285);
    expect(creditBalance(balances, fees, "GBP")).toBe(285);
    expect(debitBalance(balances, { kind: "provider_fees", owner: "stripe" }, "GBP")).toBe(94);
  });

  test("the merchant's endpoint gets a payment.succeeded delivery queued", async () => {
    const { deliver, event, state } = await paidCheckout();
    await deliver(event);
    expect(state.events.map((e) => e.event.type)).toEqual(["payment.succeeded"]);
    expect([...state.deliveries.values()]).toMatchObject([{ status: "pending", attempts: 0 }]);
  });

  test("redeliveries and repeat events for one payment change nothing", async () => {
    const { deliver, event, session, state } = await paidCheckout();
    await deliver(event);
    expect((await deliver(event)).outcome).toBe("duplicate");
    const again = stripeEvent(
      "checkout.session.async_payment_succeeded",
      checkoutCompleted(session.provider_reference, session.id),
    );
    expect((await deliver(again)).outcome).toBe("duplicate");
    expect(state.payments.size).toBe(1);
    expect(state.ledger).toHaveLength(1);
    expect(state.events).toHaveLength(1);
  });

  test("events from accounts VRS Pay doesn't own are ignored", async () => {
    const { deliver, session, state } = await paidCheckout();
    const foreign = stripeEvent(
      "checkout.session.completed",
      checkoutCompleted(session.provider_reference, session.id),
      "acct_someone_else",
    );
    expect((await deliver(foreign)).outcome).toBe("ignored");
    expect(state.payments.size).toBe(0);
  });

  test("platform-account checkouts VRS Pay didn't create (other apps) are ignored", async () => {
    const { deliver, state } = await paidCheckout();
    const other = stripeEvent(
      "checkout.session.completed",
      checkoutCompleted("cs_from_another_app", "x"),
    );
    expect((await deliver(other)).outcome).toBe("ignored");
    expect(state.payments.size).toBe(0);
    expect(state.providerEvents.size).toBe(0);
  });

  test("account.updated activates the connected account", async () => {
    const { deliver, state } = await paidCheckout();
    state.accounts.set("stripe:acct_2", {
      merchantId: "mer_test",
      mode: "test",
      status: "pending",
    });
    const update = {
      id: "acct_2",
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
    };
    expect((await deliver(stripeEvent("account.updated", update, "acct_2"))).outcome).toBe(
      "processed",
    );
    expect(state.accounts.get("stripe:acct_2")?.status).toBe("active");
  });

  test("an expired checkout is marked expired", async () => {
    const { call, deliver, session } = await paidCheckout();
    const expired = stripeEvent("checkout.session.expired", { id: session.provider_reference });
    expect((await deliver(expired)).outcome).toBe("processed");
    expect((await (await call(`/v1/checkout/sessions/${session.id}`)).json()).status).toBe(
      "expired",
    );
  });

  test("a bad signature is a 400 and nothing is recorded", async () => {
    const { app, event, state } = await paidCheckout();
    const request = await signedStripeRequest(event, "whsec_wrong");
    const res = await app.request("/webhooks/stripe", request);
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("signature_invalid");
    expect(state.payments.size).toBe(0);
  });
});
