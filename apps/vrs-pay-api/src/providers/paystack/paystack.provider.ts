import {
  type ChargeSavedInput,
  type ChargeSavedResult,
  invalidRequest,
  isVrsPayError,
  money,
  type PaymentMethod,
  type PaymentProvider,
  PROVIDER_CAPABILITIES,
  type ProviderRefundStatus,
} from "@vrs-pay/core";
import type { PaystackApi } from "./paystack-api";
import { parsePaystackWebhook, refundReference, SESSION_METADATA_KEY } from "./paystack-events";

/** Paystack's payment channels for each of our methods. */
const CHANNELS: Partial<Record<PaymentMethod, string[]>> = {
  card: ["card"],
  bank_transfer: ["bank_transfer"],
  ussd: ["ussd"],
  mobile_money: ["mobile_money"],
};

interface Initialized {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface Charge {
  status: string;
  reference: string;
  fees?: number | null;
  gateway_response?: string | null;
  /** The bank wants the customer to approve it (2FA); `authorization_url` is where. */
  paused?: boolean;
}

/** The email a Paystack customer (and so their saved cards) belongs to. */
async function customerEmail(api: PaystackApi, customerCode: string): Promise<string> {
  const customer = await api.request<{ email: string }>(
    "GET",
    `/customer/${encodeURIComponent(customerCode)}`,
  );
  return customer.email;
}

function refundStatusFrom(status: string): ProviderRefundStatus {
  if (status === "processed") return "succeeded";
  if (status === "failed") return "failed";
  return "pending";
}

function chargeResult(charge: Charge, currency: ChargeSavedInput["amount"]["currency"]) {
  if (charge.paused) {
    return {
      status: "requires_action",
      reference: charge.reference,
      message: "The customer's bank asked them to approve this charge.",
    } as const;
  }
  if (charge.status === "success") {
    return {
      status: "succeeded",
      reference: charge.reference,
      platformFee: money(0, currency),
      providerFee: money(charge.fees ?? 0, currency),
    } as const;
  }
  if (charge.status === "failed" || charge.status === "abandoned") {
    return {
      status: "declined",
      reference: charge.reference,
      message: charge.gateway_response ?? "The charge was declined.",
    } as const;
  }
  return {
    status: "error",
    reference: charge.reference,
    message: `Paystack says the charge is ${charge.status}.`,
  } as const;
}

/** An off-session charge of a saved card, verified instead when this reference was tried before. */
async function chargeAuthorization(
  api: PaystackApi,
  input: ChargeSavedInput,
): Promise<ChargeSavedResult> {
  const reference = input.idempotencyKey;
  try {
    const email = await customerEmail(api, input.providerCustomer);
    const charge = await api.request<Charge>("POST", "/transaction/charge_authorization", {
      authorization_code: input.methodRef,
      email,
      amount: input.amount.amount,
      currency: input.amount.currency,
      reference,
      metadata: input.metadata,
    });
    return chargeResult(charge, input.amount.currency);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    // A retry with the same reference: ask how the first attempt ended.
    if (/duplicate/i.test(message)) {
      const charge = await api
        .request<Charge>("GET", `/transaction/verify/${encodeURIComponent(reference)}`)
        .catch(() => null);
      if (charge) return chargeResult({ ...charge, reference }, input.amount.currency);
    }
    const retryable =
      isVrsPayError(error) && (error.details as { retryable?: boolean } | undefined)?.retryable;
    return { status: retryable ? "error" : "declined", reference, message };
  }
}

/**
 * Paystack on the platform's own account, for NGN, GHS, KES and ZAR: hosted
 * checkout, refunds, and charging saved cards for renewals.
 */
export function createPaystackProvider({
  api,
  secretKey,
}: {
  api: PaystackApi;
  secretKey: string;
}): PaymentProvider {
  return {
    id: "paystack",
    capabilities: PROVIDER_CAPABILITIES.paystack,
    async createCheckout(input) {
      if (input.mode === "setup") {
        throw invalidRequest(
          "trial_unsupported",
          "Free trials aren't available in this currency yet: start the subscription with its first payment.",
        );
      }
      const email =
        input.customerEmail ??
        (input.providerCustomer ? await customerEmail(api, input.providerCustomer) : undefined);
      // Paystack needs the buyer's email up front. Without one, our checkout
      // page asks for it, then starts the payment.
      if (!email) {
        return { provider: "paystack", reference: input.sessionId, url: input.hostedUrl ?? "" };
      }
      const data = await api.request<Initialized>("POST", "/transaction/initialize", {
        email,
        amount: input.amount.amount,
        currency: input.amount.currency,
        reference: input.sessionId,
        callback_url: input.successUrl,
        channels: CHANNELS[input.method] ?? ["card"],
        metadata: {
          ...input.metadata,
          [SESSION_METADATA_KEY]: input.sessionId,
          cancel_action: input.cancelUrl,
        },
      });
      return { provider: "paystack", reference: data.reference, url: data.authorization_url };
    },
    async refund(input) {
      const refund = await api.request<{ status: string }>("POST", "/refund", {
        transaction: input.paymentReference,
        amount: input.amount.amount,
      });
      return {
        provider: "paystack",
        // Paystack's refund events carry the payment and amount, not a refund id.
        reference: refundReference(input.paymentReference, input.amount.amount),
        status: refundStatusFrom(refund.status),
      };
    },
    parseWebhook: async ({ rawBody, headers }) => parsePaystackWebhook(rawBody, headers, secretKey),
    async ensureCustomer(input) {
      if (!input.email) {
        throw invalidRequest(
          "email_required",
          "Paystack needs the customer's email address.",
          "email",
        );
      }
      const [firstName, ...rest] = (input.name ?? "").split(/\s+/).filter(Boolean);
      const customer = await api.request<{ customer_code: string }>("POST", "/customer", {
        email: input.email,
        ...(firstName ? { first_name: firstName } : {}),
        ...(rest.length > 0 ? { last_name: rest.join(" ") } : {}),
        metadata: { vrs_customer_id: input.customerId },
      });
      return { reference: customer.customer_code };
    },
    chargeSaved: (input) => chargeAuthorization(api, input),
  };
}
