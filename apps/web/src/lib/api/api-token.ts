import { createHash, randomBytes } from "node:crypto";

const TOKEN_PREFIX = "mvrs_";

export function generateApiToken(): string {
  return `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;
}

export function hashApiToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenHint(token: string): string {
  return `${token.slice(0, 9)}...${token.slice(-4)}`;
}

export function isApiToken(token: string): boolean {
  return (
    token.startsWith(TOKEN_PREFIX) && token.length > TOKEN_PREFIX.length + 32
  );
}
