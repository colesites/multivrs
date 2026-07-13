/**
 * Next.js builder. Runs `next build` (injectable runner), then maps the route
 * manifest to a normalized BuildOutput: prerendered/static routes are served
 * from the CDN; dynamic routes invoke a single SSR `render` function (node
 * runtime). This is a bounded v1 mapping — deeper `.next` output handling
 * (per-route edge functions, ISR, image opt) comes later.
 */
import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { BuildFunction, BuildOutput, BuildRoute } from "@multivrs/build-utils";
import type { MultivrsConfig } from "@multivrs/config";
import { type CommandRunner, runBuild } from "@multivrs/static-build";
import {
  NEXT_ROUTES_MANIFEST_FILE,
  type NextRoutesManifest,
  parseNextRoutesManifestText,
} from "./manifest";

const RENDER_FUNCTION = "render";

/** Pure mapping: Next routes-manifest → normalized BuildOutput. */
export function mapNextOutput(manifest: NextRoutesManifest, staticDir: string): BuildOutput {
  const staticRoutes = manifest.staticRoutes ?? [];
  const dynamicRoutes = manifest.dynamicRoutes ?? [];

  const functions: BuildFunction[] =
    dynamicRoutes.length > 0
      ? [{ name: RENDER_FUNCTION, entrypoint: ".next/server", runtime: "node" }]
      : [];

  const routes: BuildRoute[] = [
    ...staticRoutes.map((r): BuildRoute => ({ src: r.page, target: { type: "static" } })),
    ...dynamicRoutes.map(
      (r): BuildRoute => ({
        src: r.regex ?? r.page,
        target: { type: "function", function: RENDER_FUNCTION },
      }),
    ),
  ];

  return { framework: "nextjs", staticDir, functions, routes };
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
  const manifestPath = join(result.outputDir, NEXT_ROUTES_MANIFEST_FILE);
  const text = await fs.readFile(manifestPath, "utf8");
  return mapNextOutput(parseNextRoutesManifestText(text), result.outputDir);
}
