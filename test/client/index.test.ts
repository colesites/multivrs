/**
 * Phase 0 feature test — @multivrs/client.
 * Drives the real client through create-project / create-deployment using a
 * fake fetch, asserting it (a) validates input, (b) sends the right
 * method/url/headers/body, (c) parses the typed response, and (d) surfaces
 * API errors as ApiError.
 */
import { describe, expect, test } from "bun:test";
import { ApiError, createClient } from "@multivrs/client";
import { createFakeFetch } from "../lib/fake-fetch";

const NOW = new Date().toISOString();

function projectBody(name: string) {
  return {
    id: "proj_1",
    name,
    slug: "kontinue-ai",
    framework: "nextjs",
    ownerId: "user_1",
    productionDeploymentId: null,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

describe("@multivrs/client", () => {
  test("createProject sends validated body and parses response", async () => {
    const { fetch, calls } = createFakeFetch(() => ({
      status: 201,
      body: projectBody("Kontinue AI"),
    }));
    const client = createClient({ baseUrl: "https://api.test/", fetch, token: "tok" });

    const project = await client.createProject({
      name: "Kontinue AI",
      framework: "nextjs",
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.url).toBe("https://api.test/api/projects");
    expect(calls[0]?.headers.authorization).toBe("Bearer tok");
    expect(calls[0]?.body).toEqual({ name: "Kontinue AI", framework: "nextjs" });
    expect(project.id).toBe("proj_1");
    expect(project.slug).toBe("kontinue-ai");
  });

  test("rejects invalid input before sending anything", () => {
    const { fetch, calls } = createFakeFetch(() => ({ status: 201, body: {} }));
    const client = createClient({ baseUrl: "https://api.test", fetch });

    expect(() => client.createProject({ name: "" })).toThrow();
    expect(calls).toHaveLength(0);
  });

  test("surfaces API errors as ApiError with code + status", async () => {
    const { fetch } = createFakeFetch(() => ({
      status: 409,
      body: { error: { code: "conflict", message: "slug taken" } },
    }));
    const client = createClient({ baseUrl: "https://api.test", fetch });

    const err = await client.createProject({ name: "Dup" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    if (err instanceof ApiError) {
      expect(err.status).toBe(409);
      expect(err.code).toBe("conflict");
    }
  });

  test("createDeployment targets the nested route and parses status", async () => {
    const { fetch, calls } = createFakeFetch(() => ({
      status: 201,
      body: {
        id: "dep_1",
        projectId: "proj_1",
        status: "queued",
        renderMode: null,
        commitSha: null,
        branch: "main",
        artifactHash: null,
        url: null,
        createdAt: NOW,
        updatedAt: NOW,
      },
    }));
    const client = createClient({ baseUrl: "https://api.test", fetch });

    const deployment = await client.createDeployment("proj_1", { branch: "main" });

    expect(calls[0]?.url).toBe("https://api.test/api/projects/proj_1/deployments");
    expect(calls[0]?.body).toEqual({ branch: "main", target: "preview" });
    expect(deployment.status).toBe("queued");
  });

  test("uploadDeploymentArtifact posts artifact blobs and parses ready deployment", async () => {
    const { fetch, calls } = createFakeFetch(() => ({
      status: 200,
      body: {
        id: "dep_1",
        projectId: "proj_1",
        status: "ready",
        renderMode: null,
        commitSha: null,
        branch: "main",
        artifactHash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        url: "/api/deployments/dep_1/serve",
        createdAt: NOW,
        updatedAt: NOW,
      },
    }));
    const client = createClient({ baseUrl: "https://api.test", fetch });

    const deployment = await client.uploadDeploymentArtifact("proj_1", "dep_1", {
      artifactHash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      output: {
        framework: "static",
        staticDir: ".",
        functions: [],
        routes: [{ src: "/(.*)", target: { type: "static" } }],
      },
      files: [
        {
          path: "index.html",
          hash: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          size: 12,
          contentsBase64: "PGgxPk9LPC9oMT4=",
        },
      ],
    });

    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.url).toBe("https://api.test/api/projects/proj_1/deployments/dep_1/artifact");
    expect(deployment.status).toBe("ready");
    expect(calls[0]?.body).toMatchObject({ target: "preview" });
  });

  test("updates an observable deployment lifecycle state", async () => {
    const { fetch, calls } = createFakeFetch(() => ({
      status: 200,
      body: {
        id: "dep_1",
        projectId: "proj_1",
        status: "building",
        renderMode: null,
        commitSha: null,
        branch: null,
        artifactHash: null,
        url: null,
        createdAt: NOW,
        updatedAt: NOW,
      },
    }));
    const client = createClient({ baseUrl: "https://api.test", fetch });
    await client.updateDeploymentStatus("proj_1", "dep_1", { status: "building" });
    expect(calls[0]?.url).toBe("https://api.test/api/projects/proj_1/deployments/dep_1/status");
    expect(calls[0]?.body).toEqual({ status: "building" });
  });

  test("prepares only missing blobs through the multipart artifact protocol", async () => {
    const { fetch, calls } = createFakeFetch(() => ({
      status: 200,
      body: { uploads: [{ hash: "b".repeat(64), url: "/blob/b" }] },
    }));
    const client = createClient({ baseUrl: "https://api.test", fetch });
    const prepared = await client.prepareDeploymentArtifact("proj_1", "dep_1", {
      artifactHash: "a".repeat(64),
      target: "preview",
      output: {
        framework: "static",
        staticDir: ".",
        functions: [],
        routes: [{ src: "/(.*)", target: { type: "static" } }],
      },
      files: [{ path: "index.html", hash: "b".repeat(64), size: 12 }],
    });
    expect(calls[0]?.url).toEndWith("/artifact/prepare");
    expect(prepared.uploads).toHaveLength(1);
  });
});
