/**
 * vrs-pay-api — health, versioning, request ids, auth and the error format.
 */
import { describe, expect, test } from "bun:test";
import { generateApiKey } from "@vrs-pay/core";
import { GBP_SESSION, harness } from "./harness";

describe("vrs-pay-api basics", () => {
  test("health is public and every response carries request id + version", async () => {
    const { app } = await harness();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok", version: "2026-10-01" });
    expect(res.headers.get("VRS-Request-Id")).toMatch(/^req_/);
    expect(res.headers.get("VRS-Version")).toBe("2026-10-01");
  });

  test("unknown routes are a 404 in the standard error shape", async () => {
    const { app } = await harness();
    const res = await app.request("/nope");
    expect(res.status).toBe(404);
    const { error } = await res.json();
    expect(error).toMatchObject({ type: "invalid_request_error", code: "route_not_found" });
    expect(error.request_id).toMatch(/^req_/);
  });
});

describe("authentication", () => {
  test("missing, publishable and unknown keys are 401", async () => {
    const { app, call } = await harness();
    const missing = await app.request("/v1/checkout/sessions", { method: "POST", body: "{}" });
    expect(missing.status).toBe(401);
    expect((await missing.json()).error.type).toBe("authentication_error");

    const publishable = (await generateApiKey("publishable", "test")).plaintext;
    expect(
      (await call("/v1/checkout/sessions", { body: GBP_SESSION, key: publishable })).status,
    ).toBe(401);

    const unknown = (await generateApiKey("secret", "test")).plaintext;
    expect((await call("/v1/checkout/sessions", { body: GBP_SESSION, key: unknown })).status).toBe(
      401,
    );
  });
});
