import { describe, expect, test } from "bun:test";
import {
  generateApiToken,
  hashApiToken,
  isApiToken,
  tokenHint,
} from "../../apps/web/src/lib/api/api-token";

describe("user-scoped API tokens", () => {
  test("generates opaque Multivrs tokens and stores stable hashes", () => {
    const first = generateApiToken();
    const second = generateApiToken();
    expect(isApiToken(first)).toBe(true);
    expect(first).not.toBe(second);
    expect(hashApiToken(first)).toHaveLength(64);
    expect(hashApiToken(first)).toBe(hashApiToken(first));
  });

  test("exposes only a non-secret display hint", () => {
    const token = generateApiToken();
    const hint = tokenHint(token);
    expect(hint).toStartWith("mvrs_");
    expect(hint).toEndWith(token.slice(-4));
    expect(hint).not.toContain(token);
  });
});
