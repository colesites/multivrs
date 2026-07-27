import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { MultivrsError } from "@multivrs/error-utils";

interface EncryptedValue {
  authTag: string;
  encryptedValue: string;
  iv: string;
}

function encryptionKey(): Buffer {
  const secret = process.env.ENVIRONMENT_ENCRYPTION_KEY;
  if (!secret) {
    throw new MultivrsError(
      "internal_error",
      "ENVIRONMENT_ENCRYPTION_KEY is required to store project secrets",
      503,
    );
  }
  const decoded = Buffer.from(secret, "base64");
  return decoded.length === 32
    ? decoded
    : createHash("sha256").update(secret).digest();
}

export function encryptEnvironmentValue(value: string): EncryptedValue {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  return {
    authTag: cipher.getAuthTag().toString("base64"),
    encryptedValue: encrypted.toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptEnvironmentValue(value: EncryptedValue): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(value.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(value.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(value.encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
