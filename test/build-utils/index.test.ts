/**
 * Phase 1 feature test — @multivrs/build-utils (the "artifact" stage).
 * Content-addressing must be deterministic and content-sensitive.
 */
import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createArtifact,
  LocalArtifactStore,
  resolveArtifactRequest,
  uploadArtifact,
} from "@multivrs/build-utils";

const siteDir = new URL("../fixtures/artifact/site/", import.meta.url).pathname;

describe("@multivrs/build-utils", () => {
  test("hashes every file into a sorted manifest", async () => {
    const artifact = await createArtifact(siteDir);
    expect(artifact.files.map((f) => f.path)).toEqual(["assets/style.css", "index.html"]);
    expect(artifact.hash).toMatch(/^[a-f0-9]{64}$/);
    for (const file of artifact.files) {
      expect(file.hash).toMatch(/^[a-f0-9]{64}$/);
      expect(file.size).toBeGreaterThan(0);
    }
  });

  test("is deterministic for identical input", async () => {
    const first = await createArtifact(siteDir);
    const second = await createArtifact(siteDir);
    expect(first.hash).toBe(second.hash);
  });

  test("hash changes when a file's content changes", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mv-artifact-"));
    try {
      await writeFile(join(dir, "a.txt"), "one");
      const before = await createArtifact(dir);
      await writeFile(join(dir, "a.txt"), "two");
      const after = await createArtifact(dir);
      expect(after.hash).not.toBe(before.hash);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("artifact request resolution", () => {
  test("resolves exact assets, clean HTML paths, and SPA fallbacks", async () => {
    const artifact = await createArtifact(siteDir);
    artifact.output = {
      framework: "static",
      staticDir: ".",
      functions: [],
      routes: [{ src: "/(.*)", target: { type: "static" } }],
    };
    expect(resolveArtifactRequest(artifact, "/assets/style.css")).toMatchObject({
      type: "static",
      file: { path: "assets/style.css" },
    });
    expect(resolveArtifactRequest(artifact, "/missing")).toMatchObject({
      type: "static",
      file: { path: "index.html" },
    });
    expect(resolveArtifactRequest(artifact, "/../secret")).toBeNull();
  });

  test("returns normalized function metadata for dynamic routes", () => {
    const artifact = {
      hash: "a".repeat(64),
      files: [],
      output: {
        framework: "nextjs" as const,
        staticDir: ".",
        functions: [{ name: "render", entrypoint: "server", runtime: "node" as const }],
        routes: [
          { src: "^/blog/([^/]+)$", target: { type: "function" as const, function: "render" } },
        ],
      },
    };
    expect(resolveArtifactRequest(artifact, "/blog/hello")).toMatchObject({
      type: "function",
      function: { name: "render" },
    });
  });
});

describe("ArtifactStore (upload seam)", () => {
  test("uploads an artifact then dedupes on re-upload", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mv-store-"));
    try {
      const store = new LocalArtifactStore(join(dir, "blobs"));
      const artifact = await createArtifact(siteDir);

      const first = await uploadArtifact(store, siteDir, artifact);
      expect(first.uploaded).toBe(artifact.files.length);
      expect(first.skipped).toBe(0);
      expect(await store.getManifest(artifact.hash)).toEqual(artifact);

      // every blob is now retrievable by its content hash
      for (const file of artifact.files) {
        expect(await store.has(file.hash)).toBe(true);
        expect(await store.get(file.hash)).not.toBeNull();
      }

      // re-uploading identical content is a no-op (content-addressed dedupe)
      const second = await uploadArtifact(store, siteDir, artifact);
      expect(second.uploaded).toBe(0);
      expect(second.skipped).toBe(artifact.files.length);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
