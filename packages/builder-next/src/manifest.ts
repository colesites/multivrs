/**
 * Subset of Next's `.next/routes-manifest.json` that we read to decide which
 * routes are static vs server-rendered. (Next emits much more; this v1 mapping
 * reads the route lists — full App-Router/output parsing comes later.)
 */
import { ValidationError } from "@multivrs/error-utils";
import { z } from "zod";

export const NEXT_ROUTES_MANIFEST_FILE = "routes-manifest.json";

export const nextRoutesManifestSchema = z.object({
  staticRoutes: z.array(z.object({ page: z.string() })).optional(),
  dynamicRoutes: z.array(z.object({ page: z.string(), regex: z.string().optional() })).optional(),
});
export type NextRoutesManifest = z.infer<typeof nextRoutesManifestSchema>;

export function parseNextRoutesManifest(input: unknown): NextRoutesManifest {
  const result = nextRoutesManifestSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Invalid Next routes-manifest.json", result.error.issues);
  }
  return result.data;
}

export function parseNextRoutesManifestText(text: string): NextRoutesManifest {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new ValidationError(`${NEXT_ROUTES_MANIFEST_FILE} is not valid JSON`, String(err));
  }
  return parseNextRoutesManifest(json);
}
