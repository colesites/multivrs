/**
 * Schema for `multivrs.json` — the per-project config file (our `vercel.json`).
 *
 * Validated with zod at every boundary (CLI read, API upload, build). `.strict()`
 * rejects unknown keys so typos surface instead of being silently ignored.
 * Routing rules (routes/redirects/rewrites/headers) arrive in Phase 2 via
 * `@multivrs/routing-utils`.
 */
import { z } from "zod";

/** Frameworks detection + builders understand. `null`/omitted = auto-detect. */
export const FRAMEWORK_IDS = [
  "nextjs",
  "swift-rust",
  "remix",
  "hono",
  "h3",
  "node",
  "go",
  "python",
  "ruby",
  "vite",
  "static",
] as const;

/** swift-rust per-project default render mode (see ARCHITECTURE.md §4). */
export const RENDER_MODES = ["ssr", "ssr-wasm", "ssr-htmx", "wasm"] as const;

/**
 * Function runtimes the platform executes. `bun` is the default (swift-rust's
 * backend); `node` and `edge` are also supported. Orthogonal to `renderMode`.
 */
export const RUNTIMES = ["bun", "node", "edge", "go", "python", "ruby"] as const;
export const DEFAULT_RUNTIME = "bun" satisfies (typeof RUNTIMES)[number];

const nonEmptyString = z.string().min(1);

export const multivrsConfigSchema = z
  .object({
    name: nonEmptyString.optional(),
    framework: z.enum(FRAMEWORK_IDS).nullable().optional(),
    buildCommand: z.string().nullable().optional(),
    installCommand: z.string().nullable().optional(),
    devCommand: z.string().nullable().optional(),
    outputDirectory: z.string().nullable().optional(),
    rootDirectory: z.string().nullable().optional(),
    regions: z.array(nonEmptyString).optional(),
    env: z.record(z.string(), z.string()).optional(),
    renderMode: z.enum(RENDER_MODES).optional(),
    runtime: z.enum(RUNTIMES).optional(),
  })
  .strict();

export type MultivrsConfig = z.infer<typeof multivrsConfigSchema>;
export type FrameworkId = (typeof FRAMEWORK_IDS)[number];
export type RenderMode = (typeof RENDER_MODES)[number];
export type Runtime = (typeof RUNTIMES)[number];
