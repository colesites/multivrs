/**
 * Normalized build result — the contract every framework builder produces and
 * the proxy consumes. Mirrors Vercel's Build Output API: a static dir served
 * from the CDN/R2, plus functions invoked per request, plus a route manifest
 * deciding static-vs-invoke per path (ARCHITECTURE.md §4/§6).
 */
import type { FrameworkId, RenderMode, Runtime } from "@multivrs/config";

export interface BuildFunction {
  /** Unique name, e.g. "render" (Next SSR) or "server" (swift-rust binary). */
  name: string;
  /** Path to the handler/binary entrypoint, relative to the build output. */
  entrypoint: string;
  runtime: Runtime;
  /** swift-rust render mode, when applicable. */
  renderMode?: RenderMode;
}

export type ServeTarget = { type: "static" } | { type: "function"; function: string };

export interface BuildRoute {
  /** Path or pattern. */
  src: string;
  target: ServeTarget;
}

export interface BuildOutput {
  framework: FrameworkId;
  /** Directory of static assets to upload to R2 / serve from the CDN. */
  staticDir: string;
  functions: BuildFunction[];
  /** Per-route serving manifest (static asset vs invoke a function). */
  routes: BuildRoute[];
}
