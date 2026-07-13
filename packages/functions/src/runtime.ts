/**
 * Function runtime model. A deployed function runs on one of three runtimes;
 * **bun is the default** (swift-rust's backend), with node and edge also
 * supported. The render mode (swift-rust HTML strategy) is orthogonal to this.
 *
 * The runtime enum lives in `@multivrs/config` (it's part of the `multivrs.json`
 * schema); this module adds the resolution/guard helpers builders + the proxy use.
 */
import { DEFAULT_RUNTIME, RUNTIMES, type Runtime } from "@multivrs/config";

export { DEFAULT_RUNTIME, RUNTIMES, type Runtime };

export function isRuntime(value: unknown): value is Runtime {
  return typeof value === "string" && (RUNTIMES as readonly string[]).includes(value);
}

/** Resolve a (possibly missing/invalid) runtime to a concrete one — bun default. */
export function resolveRuntime(value: string | null | undefined): Runtime {
  return isRuntime(value) ? value : DEFAULT_RUNTIME;
}

export interface FunctionConfig {
  runtime: Runtime;
  /** Regions to run in (empty = platform default). */
  regions: string[];
}

export function toFunctionConfig(input?: {
  runtime?: string | null;
  regions?: string[];
}): FunctionConfig {
  return {
    runtime: resolveRuntime(input?.runtime),
    regions: input?.regions ?? [],
  };
}
