import { randomBase62, sha256Hex } from "../crypto";
import type { ApiKeyKind, ApiKeyMode, GeneratedApiKey, ParsedApiKey } from "./api-key.types";

const KEY_BODY_LENGTH = 32;
const DISPLAY_PREFIX_LENGTH = 12;
const API_KEY_PATTERN = /^(sk|pk)_(test|live)_[0-9A-Za-z]{32}$/;

const PREFIX_BY_KIND: Record<ApiKeyKind, string> = {
  secret: "sk",
  publishable: "pk",
};

/** Parses `sk_test_…` / `pk_live_…`; returns null for anything malformed. */
export function parseApiKey(raw: string): ParsedApiKey | null {
  const match = API_KEY_PATTERN.exec(raw);
  if (!match) return null;
  return {
    kind: match[1] === "sk" ? "secret" : "publishable",
    mode: match[2] === "live" ? "live" : "test",
  };
}

export function hashApiKey(raw: string): Promise<string> {
  return sha256Hex(raw);
}

export async function generateApiKey(kind: ApiKeyKind, mode: ApiKeyMode): Promise<GeneratedApiKey> {
  const plaintext = `${PREFIX_BY_KIND[kind]}_${mode}_${randomBase62(KEY_BODY_LENGTH)}`;
  return {
    kind,
    mode,
    plaintext,
    displayPrefix: `${plaintext.slice(0, DISPLAY_PREFIX_LENGTH)}…`,
    hash: await hashApiKey(plaintext),
  };
}
