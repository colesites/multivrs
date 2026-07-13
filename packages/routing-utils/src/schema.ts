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

export function parseRoutes(input: unknown): Route[] {
  const result = routesSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Invalid routes", result.error.issues);
  }
  return result.data;
}
