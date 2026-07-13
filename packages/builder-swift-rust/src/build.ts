/**
 * swift-rust builder. Drives the swift-rust toolchain (injectable runner), then
 * reads its build manifest and maps each route's render mode to a serve target:
 * `wasm` is fully static (R2/CDN, no compute); `ssr`/`ssr-wasm`/`ssr-htmx`
 * invoke the compiled binary. (ARCHITECTURE.md §4.)
 */
import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { BuildFunction, BuildOutput, BuildRoute } from "@multivrs/build-utils";
import { DEFAULT_RUNTIME, type MultivrsConfig, type RenderMode } from "@multivrs/config";
import { type CommandRunner, runBuild } from "@multivrs/static-build";
import {
  parseSwiftRustManifestText,
  SWIFT_RUST_MANIFEST_FILE,
  type SwiftRustManifest,
} from "./manifest";

/** Render modes that require running the binary (everything except `wasm`). */
const COMPUTE_MODES: ReadonlySet<RenderMode> = new Set(["ssr", "ssr-wasm", "ssr-htmx"]);

/** Pure mapping: swift-rust manifest → normalized BuildOutput. */
export function mapSwiftRustOutput(manifest: SwiftRustManifest): BuildOutput {
  const computeRoutes = manifest.routes.filter((r) => COMPUTE_MODES.has(r.renderMode));
  const functions: BuildFunction[] =
    computeRoutes.length > 0
      ? [
          {
            name: "server",
            entrypoint: manifest.binary,
            runtime: computeRoutes[0]?.runtime ?? DEFAULT_RUNTIME,
          },
        ]
      : [];
  const routes: BuildRoute[] = manifest.routes.map((r) => ({
    src: r.src,
    target: COMPUTE_MODES.has(r.renderMode)
      ? { type: "function", function: "server" }
      : { type: "static" },
  }));
  return {
    framework: "swift-rust",
    staticDir: manifest.staticDir,
    functions,
    routes,
  };
}

export interface BuildSwiftRustOptions {
  dir: string;
  config?: MultivrsConfig;
  install?: boolean;
  run?: CommandRunner;
}

export async function buildSwiftRust(options: BuildSwiftRustOptions): Promise<BuildOutput> {
  const result = await runBuild({
    dir: options.dir,
    frameworkId: "swift-rust",
    config: options.config,
    install: options.install,
    run: options.run,
  });
  const manifestPath = join(result.outputDir, SWIFT_RUST_MANIFEST_FILE);
  const text = await fs.readFile(manifestPath, "utf8");
  return mapSwiftRustOutput(parseSwiftRustManifestText(text));
}
