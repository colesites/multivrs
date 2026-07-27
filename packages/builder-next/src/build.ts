/** Build a complete OpenNext Worker bundle for Cloudflare execution. */
import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { BuildOutput } from "@multivrs/build-utils";
import type { MultivrsConfig } from "@multivrs/config";
import { ValidationError } from "@multivrs/error-utils";
import { type CommandRunner, runBuild } from "@multivrs/static-build";

const WORKER_ENTRYPOINT = "worker.js";

export function mapNextOutput(outputDirectory: string): BuildOutput {
  return {
    framework: "nextjs",
    staticDir: join(outputDirectory, "assets"),
    functions: [{ name: "server", entrypoint: WORKER_ENTRYPOINT, runtime: "edge" }],
    routes: [{ src: "/(.*)", target: { type: "function", function: "server" } }],
  };
}

export interface BuildNextOptions {
  dir: string;
  config?: MultivrsConfig;
  install?: boolean;
  run?: CommandRunner;
}

export async function buildNext(options: BuildNextOptions): Promise<BuildOutput> {
  const result = await runBuild({
    dir: options.dir,
    frameworkId: "nextjs",
    config: options.config,
    install: options.install,
    run: options.run,
  });
  try {
    await fs.access(join(result.outputDir, WORKER_ENTRYPOINT));
  } catch {
    throw new ValidationError("OpenNext output is missing .open-next/worker.js");
  }
  return mapNextOutput(result.outputDir);
}
