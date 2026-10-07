import Stripe from "stripe";
import type { StripeApi } from "../../apps/vrs-pay-api/src/providers/stripe/stripe-api.types";

export const WEBHOOK_SECRET = "whsec_vrs_test_secret";
export const webhookSdk = new Stripe("sk_test_unused");

/** Tests build only the fields the adapter reads. */
export function partial<T>(value: Partial<T>): T {
  return value as T;
}

const CARD = partial<Stripe.PaymentMethod>({
  id: "pm_card_visa",
  card: partial<Stripe.PaymentMethod.Card>({
    brand: "visa",
    last4: "4242",
    exp_month: 12,
    exp_year: 2034,
  }),
});

export interface FakeStripeOptions {
  /** Stripe's own fee on the charge (minor units). */
  stripeFee?: number;
  applicationFee?: number;
  balanceCurrency?: string;
  refundStatus?: string;
  /** Thrown by checkout and refund calls. */
  failWith?: Error;
  /** How off-session charges end (default: succeed). */
  charge?: "succeeded" | "declined" | "auth" | "network";
}

function intentWithFees(id: string, options: FakeStripeOptions, amount?: number) {
  const fee = options.stripeFee ?? 94;
  const appFee = options.applicationFee ?? 73;
  const balance = partial<Stripe.BalanceTransaction>({
    currency: options.balanceCurrency ?? "gbp",
    fee_details: [
      partial<Stripe.BalanceTransaction.FeeDetail>({ type: "stripe_fee", amount: fee }),
      partial<Stripe.BalanceTransaction.FeeDetail>({ type: "application_fee", amount: appFee }),
    ],
  });
  const charge = partial<Stripe.Charge>({
    application_fee_amount: appFee,
    balance_transaction: balance,
  });
  return partial<Stripe.PaymentIntent>({
    id,
    amount,
    status: "succeeded",
    latest_charge: charge,
    payment_method: CARD,
    setup_future_usage: "off_session",
  });
}

function stripeError(type: string, message: string, code = "") {
  return Object.assign(new Error(message), {
    type,
    code,
    raw: { payment_intent: { id: "pi_failed" } },
  });
}

/** A Stripe API that records calls; webhook verification is the real SDK's. */
export function fakeStripeApi(options: FakeStripeOptions = {}) {
  const calls = {
    sessions: [] as Array<{
      params: Stripe.Checkout.SessionCreateParams;
      options?: Stripe.RequestOptions;
    }>,
    refunds: [] as Array<{ params?: Stripe.RefundCreateParams; options?: Stripe.RequestOptions }>,
    charges: [] as Array<{
      params: Stripe.PaymentIntentCreateParams;
      options?: Stripe.RequestOptions;
    }>,
    customers: 0,
  };
  const api: StripeApi = {
    checkout: {
      sessions: {
        async create(params, requestOptions) {
          if (options.failWith) throw options.failWith;
          calls.sessions.push({ params, options: requestOptions });
          const id = `cs_test_${calls.sessions.length}`;
          return partial<Stripe.Checkout.Session>({
            id,
            url: `https://checkout.stripe.test/${id}`,
          });
        },
      },
    },
    paymentIntents: {
      retrieve: async (id) => intentWithFees(id, options),
      async create(params, requestOptions) {
        calls.charges.push({ params, options: requestOptions });
        if (options.charge === "declined")
          throw stripeError("StripeCardError", "Your card was declined.", "card_declined");
        if (options.charge === "auth")
          throw stripeError(
            "StripeCardError",
            "Authentication required.",
            "authentication_required",
          );
        if (options.charge === "network")
          throw stripeError("StripeConnectionError", "socket hang up");
        return intentWithFees(`pi_renewal_${calls.charges.length}`, options, params.amount);
      },
    },
    setupIntents: {
      retrieve: async (id) =>
        partial<Stripe.SetupIntent>({ id, status: "succeeded", payment_method: CARD }),
    },
    customers: {
      async create() {
        calls.customers += 1;
        return partial<Stripe.Customer>({ id: `cus_stripe_${calls.customers}` });
      },
    },
    refunds: {
      async create(params, requestOptions) {
        if (options.failWith) throw options.failWith;
        calls.refunds.push({ params, options: requestOptions });
        return partial<Stripe.Refund>({
          id: `re_stripe_${calls.refunds.length}`,
          status: options.refundStatus ?? "succeeded",
        });
      },
    },
    webhooks: {
      constructEventAsync: (payload, header, secret) =>
        webhookSdk.webhooks.constructEventAsync(payload, header, secret),
    },
  };
  // Tests may change `options` mid-flow (e.g. make refunds fail after checkout).
  return { api, calls, options };
}
