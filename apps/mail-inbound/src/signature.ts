export async function signedHeaders(secret: string, body: string) {
  const timestamp = Math.floor(Date.now() / 1_000).toString();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${body}`));
  const signature = Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return {
    "content-type": "application/json",
    "x-multivrs-timestamp": timestamp,
    "x-multivrs-signature": signature,
  };
}
