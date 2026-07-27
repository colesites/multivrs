import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { createArtifact } from "@multivrs/build-utils";
import { buildRuntime, type RuntimeFramework } from "@multivrs/builder-runtime";

const FIXTURES = resolve(import.meta.dir, "../fixtures/builders");
const FRAMEWORKS: RuntimeFramework[] = ["node", "go", "python", "ruby", "remix", "hono", "h3"];

describe("container runtime builders", () => {
  for (const framework of FRAMEWORKS) {
    test(`${framework} produces a valid content-addressed artifact`, async () => {
      const dir = resolve(FIXTURES, framework);
      const output = await buildRuntime({
        config: { buildCommand: null, outputDirectory: ".multivrs-output" },
        dir,
        framework,
        install: false,
      });
      const artifact = await createArtifact(resolve(dir, ".multivrs-output"));
      artifact.output = output;
      expect(artifact.hash).toHaveLength(64);
      expect(artifact.files.some((file) => file.path === output.functions[0]?.entrypoint)).toBe(
        true,
      );
      expect(output.routes[0]?.target.type).toBe("function");
    });
  }
});
