import { hmacSha256Hex, timingSafeEqual } from "../crypto";

/**
 * Outbound webhook signatures (what `vrs.webhooks.verify()` checks):
 *   VRS-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<body>">
 * Signing the timestamp with the body lets receivers reject replays.
 */
export const SIGNATURE_HEADER = "VRS-Signature";
export const SIGNATURE_TOLERANCE_SECONDS = 300;

const HEADER_PATTERN = /^t=(\d+),v1=([0-9a-f]{64})$/;

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export async function signWebhookPayload(
  payload: string,
  secret: string,
  timestamp: number = nowSeconds(),
): Promise<string> {
  const signature = await hmacSha256Hex(secret, `${timestamp}.${payload}`);
  return `t=${timestamp},v1=${signature}`;
}

export interface VerifyWebhookInput {
  payload: string;
  header: string | null | undefined;
  secret: string;
  toleranceSeconds?: number;
  now?: number;
}

/** True only for a well-formed, fresh signature made with `secret`. */
export async function verifyWebhookSignature({
  payload,
  header,
  secret,
  toleranceSeconds = SIGNATURE_TOLERANCE_SECONDS,
  now = nowSeconds(),
}: VerifyWebhookInput): Promise<boolean> {
  const match = HEADER_PATTERN.exec(header ?? "");
  if (!match?.[1] || !match[2]) return false;
  const timestamp = Number(match[1]);
  if (Math.abs(now - timestamp) > toleranceSeconds) return false;
  const expected = await hmacSha256Hex(secret, `${timestamp}.${payload}`);
  return timingSafeEqual(expected, match[2]);
}
