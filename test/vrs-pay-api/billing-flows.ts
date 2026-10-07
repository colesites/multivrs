import { runBillingCycle } from "../../apps/vrs-pay-api/src/services/billing-engine.service";
import { harness } from "./harness";
import { type FakeStripeOptions, fakeStripeApi } from "./stripe-fakes";
import {
  checkoutCompleted,
  setupCompleted,
  signedStripeRequest,
  stripeEvent,
} from "./stripe-fixtures";

export const BILLING_CONFIG = {
  features: { custom_domains: "boolean", seats: "limit" },
  plans: {
    basic: { name: "Basic", features: { seats: 1 }, prices: { month: { GBP: 500 } } },
    pro: {
      name: "Pro",
      features: { custom_domains: true, seats: 5 },
      prices: { month: { GBP: 900 } },
    },
    trial: {
      name: "Trial",
      trial_days: 14,
      features: { custom_domains: true },
      prices: { month: { GBP: 900 } },
    },
    team: {
      name: "Team",
      payer: "org",
      features: { custom_domains: true },
      prices: { month: { GBP: 1000 } },
    },
  },
};

type Price = { id: string; interval: string };
type Plan = { key: string; prices: Price[] };

/** A merchant with the catalog synced, a user customer and an endpoint. */
export async function billingSetup(options: FakeStripeOptions = {}) {
  const stripe = fakeStripeApi(options);
  const h = await harness({ stripeApi: stripe.api });
  const sync = await (await h.call("/v1/billing/sync", { body: BILLING_CONFIG })).json();
  const priceOf = (key: string) =>
    sync.plans.find((p: Plan) => p.key === key).prices[0].id as string;
  const customer = await (
    await h.call("/v1/customers", { body: { external_id: "user_1", email: "ada@shop.test" } })
  ).json();
  const deliver = async (e: object) =>
    (await h.app.request("/webhooks/stripe", await signedStripeRequest(e))).json();
  const checkout = (price: string, body: object = {}) =>
    h.call("/v1/checkout/sessions", {
      body: {
        mode: "subscription",
        price,
        customer: customer.id,
        success_url: "https://s.test/ok",
        cancel_url: "https://s.test/no",
        ...body,
      },
    });
  const cycle = (atSeconds: number) => runBillingCycle(h.deps, new Date(atSeconds * 1000));
  return { ...h, stripeApi: stripe, priceOf, customer, deliver, checkout, cycle };
}

/** A customer subscribed to `plan` and the first period paid (or the trial started). */
export async function subscribed(plan = "pro", options: FakeStripeOptions = {}) {
  const setup = await billingSetup(options);
  const session = await (await setup.checkout(setup.priceOf(plan))).json();
  const body =
    session.amount === 0
      ? setupCompleted(session.provider_reference, session.id)
      : checkoutCompleted(session.provider_reference, session.id, session.amount);
  const outcome = await setup.deliver(stripeEvent("checkout.session.completed", body));
  const subscription = await (await setup.call(`/v1/subscriptions/${session.subscription}`)).json();
  return { ...setup, session, outcome, subscription };
}
