import { Webhook } from "svix";
import { inboundPayload } from "./normalize";
import { retrieveReceivedEmail } from "./resend";
import { receivedEventSchema } from "./schemas";
import { signedHeaders } from "./signature";

export interface Env {
  CONTROL_PLANE_URL: string;
  RESEND_WEBHOOK_SECRET: string;
  MAIL_INBOUND_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
}

async function receive(request: Request, env: Env) {
  if (!env.RESEND_WEBHOOK_SECRET || !env.MAIL_INBOUND_WEBHOOK_SECRET || !env.RESEND_API_KEY) {
    return new Response("Worker missing secrets", { status: 500 });
  }
  const body = await request.text();
  let verified: unknown;
  try {
    verified = new Webhook(env.RESEND_WEBHOOK_SECRET).verify(
      body,
      Object.fromEntries(request.headers.entries()),
    );
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }
  const parsed = receivedEventSchema.safeParse(verified);
  if (!parsed.success) return new Response("Event not supported", { status: 200 });
  try {
    const email = await retrieveReceivedEmail(env.RESEND_API_KEY, parsed.data.data.email_id);
    const payload = JSON.stringify(inboundPayload(parsed.data, email));
    const response = await fetch(`${env.CONTROL_PLANE_URL}/api/mail/inbound`, {
      method: "POST",
      headers: await signedHeaders(env.MAIL_INBOUND_WEBHOOK_SECRET, payload),
      body: payload,
    });
    if (!response.ok) throw new Error(`Control plane returned ${response.status}`);
    return new Response("OK", { status: 202 });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Worker logs are the operational failure record.
    console.error("Inbound email processing failed", error);
    return new Response("Inbound email is temporarily unavailable", { status: 503 });
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return request.method === "POST"
      ? receive(request, env)
      : new Response("Method not allowed", { status: 405 });
  },
} satisfies ExportedHandler<Env>;
