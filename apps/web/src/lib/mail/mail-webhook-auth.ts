import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_SECONDS = 300;

export async function verifyMailWebhook(
  request: Request,
  secretName:
    | "MAIL_INBOUND_WEBHOOK_SECRET"
    | "MAIL_PROVIDER_WEBHOOK_SECRET"
    | "MAIL_WORKER_SECRET",
) {
  const secret = process.env[secretName];
  if (!secret) throw new Error(`${secretName} is not configured`);
  const timestamp = request.headers.get("x-multivrs-timestamp");
  const signature = request.headers.get("x-multivrs-signature");
  if (!timestamp || !signature) throw new Error("Webhook signature is missing");
  const numeric = Number(timestamp);
  if (
    !Number.isFinite(numeric) ||
    Math.abs(Date.now() / 1_000 - numeric) > MAX_AGE_SECONDS
  ) {
    throw new Error("Webhook timestamp is outside the accepted window");
  }
  const body = await request.text();
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const provided = Buffer.from(signature, "hex");
  const target = Buffer.from(expected, "hex");
  if (provided.length !== target.length || !timingSafeEqual(provided, target)) {
    throw new Error("Webhook signature is invalid");
  }
  return body;
}
