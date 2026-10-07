import type Stripe from "stripe";

/** Request options: on a merchant's own account when given, else the platform account. */
export function requestOptions(
  account: string | null,
  idempotencyKey?: string,
): Stripe.RequestOptions {
  return {
    ...(account ? { stripeAccount: account } : {}),
    ...(idempotencyKey ? { idempotencyKey } : {}),
  };
}

const MAX_SUFFIX = 22;

/**
 * Text for the card statement after the platform's prefix: letters,
 * digits and spaces only (Stripe rejects < > \ ' " *), at most 22 chars.
 */
export function descriptorSuffix(text: string | undefined): string | undefined {
  const clean = (text ?? "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SUFFIX)
    .trim();
  return clean.length >= 2 ? clean : undefined;
}
