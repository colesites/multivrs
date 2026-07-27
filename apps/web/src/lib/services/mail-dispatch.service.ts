import "server-only";
import { createHmac } from "node:crypto";
import { deliverMailMessage } from "@/lib/services/mail-delivery.service";

export async function dispatchMailDelivery(userId: string, messageId: string) {
  const workerUrl = process.env.MAIL_WORKER_URL;
  const secret = process.env.MAIL_WORKER_SECRET;
  if (!workerUrl || !secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MAIL_WORKER_URL and MAIL_WORKER_SECRET are required");
    }
    await deliverMailMessage(userId, messageId);
    return;
  }
  const body = JSON.stringify({ userId, messageId });
  const timestamp = Math.floor(Date.now() / 1_000).toString();
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const response = await fetch(`${workerUrl.replace(/\/$/, "")}/queue`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-multivrs-timestamp": timestamp,
      "x-multivrs-signature": signature,
    },
    body,
  });
  if (!response.ok) throw new Error("Mail worker rejected the delivery job");
}
