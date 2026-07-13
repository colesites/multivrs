/**
 * The swift-rust build manifest — the contract the swift-rust toolchain emits
 * for us (per ARCHITECTURE.md §4: the build must declare the render mode per
 * route). We own this contract; the real toolchain conforms to it (PLAN.md §7
 * open #1). It names the compiled binary, the static dir, and each route's mode.
 */
import { RENDER_MODES, RUNTIMES } from "@multivrs/config";
import { ValidationError } from "@multivrs/error-utils";
import { z } from "zod";

export const SWIFT_RUST_MANIFEST_FILE = "multivrs-build.json";

export const swiftRustRouteSchema = z.object({
  src: z.string().min(1),
  renderMode: z.enum(RENDER_MODES),
  runtime: z.enum(RUNTIMES).optional(),
});
export type SwiftRustRoute = z.infer<typeof swiftRustRouteSchema>;

export const swiftRustManifestSchema = z.object({
  framework: z.literal("swift-rust").optional(),
  /** Compiled, statically-linked server binary (used by ssr* routes). */
  binary: z.string().min(1),
  /** Directory of static assets (wasm bundles, public files). */
  staticDir: z.string().min(1),
  routes: z.array(swiftRustRouteSchema).min(1),
});
export type SwiftRustManifest = z.infer<typeof swiftRustManifestSchema>;

export function parseSwiftRustManifest(input: unknown): SwiftRustManifest {
  const result = swiftRustManifestSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Invalid swift-rust build manifest", result.error.issues);
  }
  return result.data;
}

export function parseSwiftRustManifestText(text: string): SwiftRustManifest {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new ValidationError(`${SWIFT_RUST_MANIFEST_FILE} is not valid JSON`, String(err));
  }
  return parseSwiftRustManifest(json);
}
