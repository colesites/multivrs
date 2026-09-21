/**
 * Generates a unique client-side id.
 *
 * `crypto.randomUUID` needs Safari 15.4, and older iOS and macOS throw on it,
 * so fall back to random bytes and finally to `Math.random`. These ids label
 * rows and requests in the UI; they are not used for anything security
 * sensitive, where the server generates its own.
 */
export function randomId(): string {
  const webCrypto = globalThis.crypto;

  if (typeof webCrypto?.randomUUID === "function") {
    return webCrypto.randomUUID();
  }

  if (typeof webCrypto?.getRandomValues === "function") {
    const bytes = webCrypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
