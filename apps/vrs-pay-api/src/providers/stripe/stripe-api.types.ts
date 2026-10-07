import type Stripe from "stripe";

/**
 * The slice of the Stripe SDK the adapter uses. A real `Stripe` instance
 * satisfies it; tests pass a small fake instead.
 */
export interface StripeApi {
  checkout: {
    sessions: {
      create(
        params: Stripe.Checkout.SessionCreateParams,
        options?: Stripe.RequestOptions,
      ): Promise<Stripe.Checkout.Session>;
    };
  };
  paymentIntents: {
    retrieve(
      id: string,
      params?: Stripe.PaymentIntentRetrieveParams,
      options?: Stripe.RequestOptions,
    ): Promise<Stripe.PaymentIntent>;
    create(
      params: Stripe.PaymentIntentCreateParams,
      options?: Stripe.RequestOptions,
    ): Promise<Stripe.PaymentIntent>;
  };
  setupIntents: {
    retrieve(
      id: string,
      params?: Stripe.SetupIntentRetrieveParams,
      options?: Stripe.RequestOptions,
    ): Promise<Stripe.SetupIntent>;
  };
  customers: {
    create(
      params?: Stripe.CustomerCreateParams,
      options?: Stripe.RequestOptions,
    ): Promise<Stripe.Customer>;
  };
  refunds: {
    create(
      params?: Stripe.RefundCreateParams,
      options?: Stripe.RequestOptions,
    ): Promise<Stripe.Refund>;
  };
  webhooks: {
    constructEventAsync(payload: string, header: string, secret: string): Promise<Stripe.Event>;
  };
}

export interface StripeProviderConfig {
  api: StripeApi;
  /**
   * Signing secrets to try, in order: the platform endpoint's and the
   * Connect endpoint's (they differ in production; `stripe listen` uses one).
   */
  webhookSecrets: readonly string[];
}
