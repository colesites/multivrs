import { describe, expect, test } from "bun:test";
import {
  resolveRequest,
  selectAssetVariant,
} from "../../apps/serve-worker/src/resolve";
import type { ArtifactManifest } from "../../apps/serve-worker/src/types";

const manifest: ArtifactManifest = {
  hash: "a".repeat(64),
  files: [
    { path: "index.html", hash: "b".repeat(64), size: 10 },
    { path: "assets/app.js", hash: "c".repeat(64), size: 10 },
  ],
  output: {
    functions: [{ name: "render", entrypoint: "server", runtime: "node" }],
    routes: [
      { src: "^/api/(.*)$", target: { type: "function", function: "render" } },
      { src: "/(.*)", target: { type: "static" } },
    ],
  },
};

describe("serve worker resolver", () => {
  test("serves immutable artifact files", () => {
    expect(resolveRequest(manifest, "/assets/app.js")).toMatchObject({
      type: "static",
      file: { path: "assets/app.js" },
    });
  });

  test("hands dynamic routes to compute", () => {
    expect(resolveRequest(manifest, "/api/users")).toMatchObject({
      type: "function",
      function: { name: "render" },
    });
  });

  test("falls back to the static entrypoint", () => {
    expect(resolveRequest(manifest, "/dashboard")).toMatchObject({
      type: "static",
      file: { path: "index.html" },
    });
  });

  test("selects generated media variants only for compatible clients", () => {
    const original = { path: "public/photo.jpg", hash: "photo", size: 10 };
    const variant = { path: "public/photo.jpg.webp", hash: "webp", size: 5 };
    const withVariant = { ...manifest, files: [...manifest.files, original, variant] };
    expect(selectAssetVariant(withVariant, original, "image/webp,image/*")).toBe(variant);
    expect(selectAssetVariant(withVariant, original, "image/jpeg")).toBe(original);
  });
});
