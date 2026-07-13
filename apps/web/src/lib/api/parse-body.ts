/**
 * Validate a request body against a zod schema, throwing `ValidationError`
 * (→ 422) on bad JSON or schema mismatch.
 */
import { ValidationError } from "@multivrs/error-utils";
import type { z } from "zod";

export async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    json = undefined;
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new ValidationError("Invalid request body", result.error.issues);
  }
  return result.data;
}
