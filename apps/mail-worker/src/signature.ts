const encoder = new TextEncoder();

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function signedHeaders(secret: string, body: string) {
  const timestamp = Math.floor(Date.now() / 1_000).toString();
  return {
    "content-type": "application/json",
    "x-multivrs-timestamp": timestamp,
    "x-multivrs-signature": await hmac(secret, `${timestamp}.${body}`),
  };
}

export async function validSignature(request: Request, secret: string, body: string) {
  const timestamp = request.headers.get("x-multivrs-timestamp");
  const signature = request.headers.get("x-multivrs-signature");
  if (!timestamp || !signature || Math.abs(Date.now() / 1_000 - Number(timestamp)) > 300)
    return false;
  return signature === (await hmac(secret, `${timestamp}.${body}`));
}
