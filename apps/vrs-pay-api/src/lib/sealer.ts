/** Encrypts small secrets (bank details) at rest with AES-256-GCM. */
export interface Sealer {
  seal(plaintext: string): Promise<string>;
  open(sealed: string): Promise<string>;
}

const VERSION = "v1";
const IV_BYTES = 12;

const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");
const fromBase64 = (text: string) => new Uint8Array(Buffer.from(text, "base64url"));

/** A sealer from a base64 32-byte key (VRS_DATA_KEY). */
export async function createSealer(base64Key: string): Promise<Sealer> {
  const raw = fromBase64(base64Key.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, ""));
  if (raw.length !== 32) throw new Error("VRS_DATA_KEY must be 32 bytes, base64-encoded.");
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
  return {
    async seal(plaintext) {
      const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
      const data = new TextEncoder().encode(plaintext);
      const cipher = new Uint8Array(
        await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data),
      );
      return `${VERSION}.${toBase64(iv)}.${toBase64(cipher)}`;
    },
    async open(sealed) {
      const [version, iv, cipher] = sealed.split(".");
      if (version !== VERSION || !iv || !cipher) throw new Error("Unrecognized sealed value.");
      const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fromBase64(iv) },
        key,
        fromBase64(cipher),
      );
      return new TextDecoder().decode(plain);
    },
  };
}
