import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { BuildOutput } from "@multivrs/build-utils";
import type { FrameworkId, MultivrsConfig, Runtime } from "@multivrs/config";
import { ValidationError } from "@multivrs/error-utils";
import { type CommandRunner, runBuild } from "@multivrs/static-build";

const TARGETS = {
  go: { entrypoint: "server", runtime: "go", staticDir: "." },
  h3: { entrypoint: "server.js", runtime: "bun", staticDir: "." },
  hono: { entrypoint: "server.js", runtime: "bun", staticDir: "." },
  node: { entrypoint: "server.js", runtime: "bun", staticDir: "." },
  python: { entrypoint: "app.py", runtime: "python", staticDir: "." },
  remix: { entrypoint: "server.js", runtime: "bun", staticDir: "client" },
  ruby: { entrypoint: "app.rb", runtime: "ruby", staticDir: "." },
} satisfies Partial<
  Record<FrameworkId, { entrypoint: string; runtime: Runtime; staticDir: string }>
>;

export type RuntimeFramework = keyof typeof TARGETS;

export interface BuildRuntimeOptions {
  config?: MultivrsConfig;
  dir: string;
  framework: RuntimeFramework;
  install?: boolean;
  run?: CommandRunner;
}

export function mapRuntimeOutput(framework: RuntimeFramework): BuildOutput {
  const target = TARGETS[framework];
  return {
    framework,
    functions: [{ entrypoint: target.entrypoint, name: "server", runtime: target.runtime }],
    routes: [{ src: "/(.*)", target: { function: "server", type: "function" } }],
    staticDir: target.staticDir,
  };
}

export async function buildRuntime(options: BuildRuntimeOptions): Promise<BuildOutput> {
  const result = await runBuild({
    config: options.config,
    dir: options.dir,
    frameworkId: options.framework,
    install: options.install,
    run: options.run,
  });
  const output = mapRuntimeOutput(options.framework);
  const entrypoint = output.functions[0]?.entrypoint;
  if (!entrypoint) throw new ValidationError("Runtime builder has no entrypoint");
  try {
    await fs.access(join(result.outputDir, entrypoint));
  } catch {
    throw new ValidationError(`${options.framework} output is missing ${entrypoint}`);
  }
  return output;
}
