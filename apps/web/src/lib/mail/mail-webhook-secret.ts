import "server-only";
import { createHmac } from "node:crypto";

function masterKey() {
  const key = process.env.MAIL_WEBHOOK_MASTER_KEY ?? process.env.MAIL_WORKER_SECRET;
  if (!key) throw new Error("MAIL_WEBHOOK_MASTER_KEY is required");
  return key;
}

export function mailWebhookSecret(endpointId: string) {
  const value = createHmac("sha256", masterKey()).update(endpointId).digest("base64url");
  return `whsec_${value}`;
}
