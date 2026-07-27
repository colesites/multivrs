import { describe, expect, test } from "bun:test";
import { buildJobSchema } from "@multivrs/client";
import { hasValidWorkerToken } from "../../apps/build-worker/src/auth";

const validJob = {
  apiToken: `mvrs_${"a".repeat(40)}`,
  apiUrl: "https://multivrs.space",
  deploymentId: "deployment-1",
  framework: "nextjs",
  input: {
    branch: "main",
    repoUrl: "https://github.com/owner/project",
    rootDirectory: "apps/web",
    target: "production",
  },
  projectId: "project-1",
};

describe("Cloudflare build jobs", () => {
  test("accepts a contained GitHub build job", () => {
    expect(buildJobSchema.safeParse(validJob).success).toBe(true);
  });

  test("rejects non-GitHub repositories and escaping roots", () => {
    expect(
      buildJobSchema.safeParse({
        ...validJob,
        input: { ...validJob.input, repoUrl: "https://example.com/repo" },
      }).success,
    ).toBe(false);
    expect(
      buildJobSchema.safeParse({
        ...validJob,
        input: { ...validJob.input, rootDirectory: "../../private" },
      }).success,
    ).toBe(false);
  });

  test("requires the exact worker bearer token", () => {
    const request = new Request("https://worker.test/jobs", {
      headers: { authorization: "Bearer secret-token" },
    });
    expect(hasValidWorkerToken(request, "secret-token")).toBe(true);
    expect(hasValidWorkerToken(request, "different-token")).toBe(false);
  });
});
