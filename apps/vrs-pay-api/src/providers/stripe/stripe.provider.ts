import {
  invalidRequest,
  type PaymentProvider,
  PROVIDER_CAPABILITIES,
  providerRequestFailed,
} from "@vrs-pay/core";
import type { StripeApi, StripeProviderConfig } from "./stripe-api.types";
import { call } from "./stripe-call";
import { chargeSavedStripe, ensureStripeCustomer } from "./stripe-charges";
import { checkoutParams, paymentIntentParams, setupIntentParams } from "./stripe-checkout";
import { REFUND_METADATA_KEY, refundStatusFrom, toProviderEvent } from "./stripe-events";
import { requestOptions } from "./stripe-options";

async function verify(api: StripeApi, payload: string, header: string, secrets: readonly string[]) {
  for (const secret of secrets) {
    try {
      return await api.webhooks.constructEventAsync(payload, header, secret);
    } catch {
      // Try the next endpoint's secret.
    }
  }
  throw invalidRequest("signature_invalid", "No valid Stripe signature found.", "Stripe-Signature");
}

/**
 * Stripe Connect with direct charges: payments are made on the merchant's
 * connected account; VRS Pay's cut is the application fee.
 */
export function createStripeProvider({
  api,
  webhookSecrets,
}: StripeProviderConfig): PaymentProvider {
  return {
    id: "stripe",
    capabilities: PROVIDER_CAPABILITIES.stripe,
    async createCheckout(input) {
      if (input.mode === "setup") {
        const intent = await call("setup_intent", () =>
          api.setupIntents.create(
            setupIntentParams(input),
            requestOptions(input.merchantAccountId, input.idempotencyKey),
          ),
        );
        const url = input.hostedUrl ?? `https://pay.test/stripe/${input.sessionId}`;
        return {
          provider: "stripe",
          reference: intent.id,
          url,
          clientSecret: intent.client_secret ?? undefined,
        };
      }
      const intent = await call("payment_intent", () =>
        api.paymentIntents.create(
          paymentIntentParams(input),
          requestOptions(input.merchantAccountId, input.idempotencyKey),
        ),
      );
      const url = input.hostedUrl ?? `https://pay.test/stripe/${input.sessionId}`;
      return {
        provider: "stripe",
        reference: intent.id,
        url,
        clientSecret: intent.client_secret ?? undefined,
      };
    },
    async refund(input) {
      const refund = await call("refund", () =>
        api.refunds.create(
          {
            payment_intent: input.paymentReference,
            amount: input.amount.amount,
            ...(input.reason ? { reason: input.reason } : {}),
            metadata: { [REFUND_METADATA_KEY]: input.refundId },
          },
          requestOptions(input.merchantAccountId, input.idempotencyKey),
        ),
      );
      return { provider: "stripe", reference: refund.id, status: refundStatusFrom(refund.status) };
    },
    async parseWebhook({ rawBody, headers }) {
      const header = headers.get("stripe-signature");
      if (!header) {
        throw invalidRequest(
          "signature_missing",
          "Missing Stripe-Signature header.",
          "Stripe-Signature",
        );
      }
      return toProviderEvent(api, await verify(api, rawBody, header, webhookSecrets));
    },
    ensureCustomer: (input) => ensureStripeCustomer(api, input),
    chargeSaved: (input) => chargeSavedStripe(api, input),
  };
}
