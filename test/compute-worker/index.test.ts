import { describe, expect, test } from "bun:test";
import { parseRuntimeRequest } from "../../apps/compute-worker/src/request";

describe("native compute request boundary", () => {
  test("accepts a deployment id and content hash", () => {
    const request = new Request("https://compute.internal/hello", {
      headers: {
        "x-multivrs-artifact": "a".repeat(64),
        "x-multivrs-deployment": "deployment_123",
        "x-multivrs-entrypoint": "server",
        "x-multivrs-runtime": "bun",
      },
    });
    expect(parseRuntimeRequest(request)).toEqual({
      artifactHash: "a".repeat(64),
      deploymentId: "deployment_123",
      entrypoint: "server",
      environment: {},
      runtime: "bun",
    });
  });

  test("decodes validated runtime environment variables", () => {
    const environment = btoa(JSON.stringify({ API_URL: "https://api.example.com" }));
    const request = new Request("https://compute.internal", {
      headers: {
        "x-multivrs-artifact": "b".repeat(64),
        "x-multivrs-deployment": "deployment_456",
        "x-multivrs-environment": environment,
        "x-multivrs-entrypoint": "server.py",
        "x-multivrs-runtime": "python",
      },
    });
    expect(parseRuntimeRequest(request)?.environment).toEqual({
      API_URL: "https://api.example.com",
    });
  });

  test("rejects unsafe ids and malformed hashes", () => {
    const request = new Request("https://compute.internal", {
      headers: {
        "x-multivrs-artifact": "not-a-hash",
        "x-multivrs-deployment": "../../escape",
        "x-multivrs-entrypoint": "../server",
        "x-multivrs-runtime": "go",
      },
    });
    expect(parseRuntimeRequest(request)).toBeNull();
  });
});
