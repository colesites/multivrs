/**
 * Routing rule schema. A `Route` is a regex `src` matched against the request
 * pathname, with optional rewrite/redirect `dest` (supporting `$1` backrefs),
 * `status` (3xx ⇒ redirect), `headers`, `methods` filter, and `continue` (apply
 * and keep matching — used for header rules).
 */
import { ValidationError } from "@multivrs/error-utils";
import { z } from "zod";

export const routeSchema = z.object({
  src: z.string().min(1),
  dest: z.string().optional(),
  status: z.number().int().min(100).max(599).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  methods: z.array(z.string()).optional(),
  continue: z.boolean().optional(),
});

export type Route = z.infer<typeof routeSchema>;

export const routesSchema = z.array(routeSchema);

export const bulkRedirectSchema = z.object({
  destination: z.string().min(1).max(2_000),
  preserveQuery: z.boolean().default(true),
  source: z.string().startsWith("/").max(1_000),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]),
});

export const microfrontendRouteSchema = z.object({
  source: z.string().startsWith("/").max(1_000),
  stripPrefix: z.boolean().default(false),
  targetProjectId: z.string().uuid(),
});

export const runtimeProjectConfigSchema = z.object({
  bulkRedirects: z.array(bulkRedirectSchema),
  cacheTagVersions: z.record(z.string(), z.string()),
  edgeConfig: z.record(z.string(), z.json()),
  microfrontends: z.array(microfrontendRouteSchema),
  version: z.string().min(1),
});

export type BulkRedirect = z.infer<typeof bulkRedirectSchema>;
export type MicrofrontendRoute = z.infer<typeof microfrontendRouteSchema>;
export type RuntimeProjectConfig = z.infer<typeof runtimeProjectConfigSchema>;

export function parseRoutes(input: unknown): Route[] {
  const result = routesSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Invalid routes", result.error.issues);
  }
  return result.data;
}
