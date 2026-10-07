import type { VrsPayEvent } from "./billing.types";

export const SIGNATURE_HEADER = "VRS-Signature";
const TOLERANCE_SECONDS = 300;
const HEADER_PATTERN = /^t=(\d+),v1=([0-9a-f]{64})$/;

async function hmacHex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * True for a fresh, genuine `VRS-Signature` (`t=<seconds>,v1=<hex HMAC of
 * "<t>.<body>">`). Pass the raw request body, not parsed JSON.
 */
export async function verifyWebhook(
  payload: string,
  header: string | null | undefined,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  const match = HEADER_PATTERN.exec(header ?? "");
  if (!match?.[1] || !match[2]) return false;
  if (Math.abs(now - Number(match[1])) > TOLERANCE_SECONDS) return false;
  return sameText(await hmacHex(secret, `${match[1]}.${payload}`), match[2]);
}

/** The event in a verified webhook; throws when the signature doesn't check out. */
export async function constructEvent(
  payload: string,
  header: string | null | undefined,
  secret: string,
): Promise<VrsPayEvent> {
  if (!(await verifyWebhook(payload, header, secret))) {
    throw new Error("VRS Pay webhook signature didn't verify.");
  }
  return JSON.parse(payload) as VrsPayEvent;
}
