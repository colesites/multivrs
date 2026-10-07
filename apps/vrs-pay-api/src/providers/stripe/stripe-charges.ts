import type { ChargeSavedInput, ChargeSavedResult, ProviderCustomerInput } from "@vrs-pay/core";
import type { StripeApi } from "./stripe-api.types";
import { call, RETRYABLE_ERRORS, stripeErrorType } from "./stripe-call";
import { chargeDetails, INTENT_EXPAND } from "./stripe-fees";
import { descriptorSuffix, requestOptions } from "./stripe-options";

export const CUSTOMER_METADATA_KEY = "vrs_customer_id";

export async function ensureStripeCustomer(api: StripeApi, input: ProviderCustomerInput) {
  const customer = await call("customer", () =>
    api.customers.create(
      {
        ...(input.email ? { email: input.email } : {}),
        ...(input.name ? { name: input.name } : {}),
        metadata: { [CUSTOMER_METADATA_KEY]: input.customerId },
      },
      requestOptions(input.merchantAccountId, input.idempotencyKey),
    ),
  );
  return { reference: customer.id };
}

/** The PaymentIntent id Stripe attaches to card errors, when there is one. */
function intentIdOf(error: unknown): string | null {
  if (!(error instanceof Error) || !("raw" in error)) return null;
  const raw = error.raw;
  if (typeof raw !== "object" || raw === null || !("payment_intent" in raw)) return null;
  const intent = raw.payment_intent;
  return typeof intent === "object" && intent !== null && "id" in intent ? String(intent.id) : null;
}

/** An off-session direct charge on the connected account, with our application fee. */
export async function chargeSavedStripe(
  api: StripeApi,
  input: ChargeSavedInput,
): Promise<ChargeSavedResult> {
  const fee = input.platformFee.amount;
  try {
    const intent = await api.paymentIntents.create(
      {
        amount: input.amount.amount,
        currency: input.amount.currency.toLowerCase(),
        customer: input.providerCustomer,
        payment_method: input.methodRef,
        off_session: true,
        confirm: true,
        description: input.description,
        metadata: input.metadata,
        // Our fee is a separate application fee only on a merchant's own account.
        ...(fee > 0 && input.merchantAccountId ? { application_fee_amount: fee } : {}),
        ...(descriptorSuffix(input.statementDescriptor)
          ? { statement_descriptor_suffix: descriptorSuffix(input.statementDescriptor) }
          : {}),
        expand: INTENT_EXPAND,
      },
      requestOptions(input.merchantAccountId, input.idempotencyKey),
    );
    if (intent.status !== "succeeded") {
      return {
        status: "requires_action",
        reference: intent.id,
        message: `Payment is ${intent.status}.`,
      };
    }
    const { platformFee, providerFee } = chargeDetails(intent, input.amount.currency);
    return { status: "succeeded", reference: intent.id, platformFee, providerFee };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const type = stripeErrorType(error);
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    if (code === "authentication_required") {
      return { status: "requires_action", reference: intentIdOf(error), message };
    }
    const status = type === "StripeCardError" ? "declined" : "error";
    if (status === "error" && !RETRYABLE_ERRORS.has(type)) {
      return { status: "declined", reference: intentIdOf(error), message };
    }
    return { status, reference: intentIdOf(error), message };
  }
}
