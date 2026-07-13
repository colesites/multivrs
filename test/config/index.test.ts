/**
 * Phase 0 feature test — @multivrs/config.
 * Runs the real parser against valid/invalid `multivrs.json` fixtures,
 * mirroring vercel/vercel's fixture-driven `index.test.js` pattern.
 */
import { describe, expect, test } from "bun:test";
import { parseConfig, parseConfigFromJson, safeParseConfig } from "@multivrs/config";
import { ValidationError } from "@multivrs/error-utils";

const fixtures = new URL("../fixtures/config/", import.meta.url);

function readFixture(name: string): Promise<string> {
  return Bun.file(new URL(name, fixtures)).text();
}

describe("@multivrs/config", () => {
  test("parses a valid multivrs.json fixture", async () => {
    const config = parseConfigFromJson(await readFixture("valid/multivrs.json"));
    expect(config.name).toBe("kontinue-ai");
    expect(config.framework).toBe("nextjs");
    expect(config.env?.API_URL).toBe("https://api.example.com");
    expect(config.regions).toEqual(["iad1"]);
  });

  test("rejects the invalid multivrs.json fixture", async () => {
    const text = await readFixture("invalid/multivrs.json");
    expect(() => parseConfigFromJson(text)).toThrow(ValidationError);
  });

  test("safeParseConfig reports issues instead of throwing", () => {
    const result = safeParseConfig({ framework: "rails" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  test("rejects unknown keys (strict schema)", () => {
    expect(() => parseConfig({ name: "x", bogus: 1 })).toThrow(ValidationError);
  });

  test("accepts runtime + renderMode (bun/node/edge, swift-rust modes)", () => {
    const config = parseConfig({
      framework: "swift-rust",
      runtime: "bun",
      renderMode: "ssr-wasm",
    });
    expect(config.runtime).toBe("bun");
    expect(config.renderMode).toBe("ssr-wasm");
    expect(() => parseConfig({ runtime: "deno" })).toThrow(ValidationError);
  });

  test("rejects non-JSON input", () => {
    expect(() => parseConfigFromJson("{ not json")).toThrow(ValidationError);
  });
});
