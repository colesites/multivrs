import Stripe from "stripe";

/** The Stripe SDK on the platform account, with Bun's fetch and SDK retries. */
export function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    maxNetworkRetries: 2,
    httpClient: Stripe.createFetchHttpClient(),
    appInfo: { name: "VRS Pay" },
  });
}

/** Whether a Stripe secret or restricted key is a live one. */
export function isLiveStripeKey(key: string): boolean {
  return /^(sk|rk)_live_/.test(key);
}
