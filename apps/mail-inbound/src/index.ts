import { Webhook } from "svix";

export interface Env {
  CONTROL_PLANE_URL: string;
  RESEND_WEBHOOK_SECRET: string;
  MAIL_INBOUND_WEBHOOK_SECRET: string;
}

function parseEmail(str: string): { name?: string; address: string } {
  const match = str.match(/(?:(.*?)<)?([^>]+)>?/);
  if (match) {
    const name = match[1]?.trim().replace(/^["']|["']$/g, '');
    const address = match[2]?.trim();
    return { name: name || undefined, address };
  }
  return { address: str.trim() };
}

function extractEmailAddresses(arr: string[]): string[] {
  return arr.map(a => parseEmail(a).address);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const payload = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    
    if (!env.RESEND_WEBHOOK_SECRET || !env.MAIL_INBOUND_WEBHOOK_SECRET) {
      return new Response("Worker missing secrets", { status: 500 });
    }

    // Verify Resend signature
    const wh = new Webhook(env.RESEND_WEBHOOK_SECRET);
    let event: any;
    try {
      event = wh.verify(payload, headers);
    } catch (err) {
      return new Response("Invalid signature", { status: 401 });
    }

    if (event.type !== "email.received") {
      return new Response("Event not supported", { status: 200 });
    }

    const data = event.data;
    const fromParsed = parseEmail(data.from || "");
    
    // Convert to InboundMailInput format
    const inboundBody = JSON.stringify({
      providerEventId: data.id || `resend_${data.created_at}`,
      mailbox: extractEmailAddresses(data.to || [])[0],
      messageId: data.headers?.["Message-Id"] || data.headers?.["message-id"] || crypto.randomUUID(),
      inReplyTo: data.headers?.["In-Reply-To"] || data.headers?.["in-reply-to"],
      references: [data.headers?.["References"] || data.headers?.["references"]].filter(Boolean),
      from: fromParsed.address,
      fromName: fromParsed.name,
      to: extractEmailAddresses(data.to || []),
      cc: extractEmailAddresses(data.cc || []),
      subject: data.subject || "(no subject)",
      text: data.text || "",
      html: data.html || "",
      headers: data.headers || {},
    });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create HMAC signature using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(env.MAIL_INBOUND_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${timestamp}.${inboundBody}`)
    );
    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    const response = await fetch(`${env.CONTROL_PLANE_URL}/api/mail/inbound`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-multivrs-timestamp": timestamp,
        "x-multivrs-signature": signatureHex,
      },
      body: inboundBody,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Control plane rejected webhook:", err);
      return new Response(`Control plane failed: ${err}`, { status: response.status });
    }

    return new Response("OK", { status: 202 });
  }
}
