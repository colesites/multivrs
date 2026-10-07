import { providerRequestFailed } from "@vrs-pay/core";

/** Stripe SDK error types where Stripe may still have done the work. */
export const RETRYABLE_ERRORS = new Set([
  "StripeConnectionError",
  "StripeAPIError",
  "StripeRateLimitError",
]);

/** The SDK's error `type` (e.g. "StripeCardError"), or "" for anything else. */
export function stripeErrorType(error: unknown): string {
  return error instanceof Error && "type" in error ? String(error.type) : "";
}

/** Turns SDK failures into a 502 the merchant can read. */
export async function call<T>(operation: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const retryable = RETRYABLE_ERRORS.has(stripeErrorType(error));
    throw providerRequestFailed("stripe", operation, message, retryable);
  }
}
