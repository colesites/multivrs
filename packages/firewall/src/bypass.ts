import { z } from "zod";

const payloadSchema = z.object({
  expiresAt: z.number().int().positive(),
  pathPrefix: z.string().startsWith("/").max(2_000),
  projectId: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
});
export type FirewallBypassPayload = z.infer<typeof payloadSchema>;

export async function createFirewallBypassToken(
  payload: FirewallBypassPayload,
  secret: string,
): Promise<string> {
  const body = encode(new TextEncoder().encode(JSON.stringify(payloadSchema.parse(payload))));
  return `${body}.${encode(new Uint8Array(await sign(body, secret)))}`;
}

export async function verifyFirewallBypassToken(
  token: string,
  secret: string,
  expected: { path: string; projectId: string },
): Promise<boolean> {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) return false;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await key(secret),
    decode(signature),
    new TextEncoder().encode(body),
  );
  if (!valid) return false;
  const parsed = payloadSchema.safeParse(parseBody(body));
  return Boolean(
    parsed.success &&
      parsed.data.expiresAt > Date.now() &&
      parsed.data.projectId === expected.projectId &&
      matchesPath(expected.path, parsed.data.pathPrefix),
  );
}

function parseBody(body: string): unknown {
  try {
    return JSON.parse(new TextDecoder().decode(decode(body)));
  } catch {
    return null;
  }
}

function matchesPath(path: string, prefix: string): boolean {
  return prefix === "/" || path === prefix || path.startsWith(`${prefix.replace(/\/$/, "")}/`);
}

async function sign(body: string, secret: string): Promise<ArrayBuffer> {
  return crypto.subtle.sign("HMAC", await key(secret), new TextEncoder().encode(body));
}

function key(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign", "verify"],
  );
}

function encode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decode(value: string): ArrayBuffer {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  const result = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(result);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return result;
}
