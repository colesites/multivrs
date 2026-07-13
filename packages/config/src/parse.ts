/**
 * Parse + validate `multivrs.json`. On failure throws a `ValidationError`
 * carrying the zod issues, so callers get one consistent error type.
 */
import { ValidationError } from "@multivrs/error-utils";
import { type MultivrsConfig, multivrsConfigSchema } from "./schema";

export type SafeParseResult =
  | { success: true; data: MultivrsConfig }
  | { success: false; error: ValidationError };

/** Validate an already-parsed object. Throws `ValidationError` on failure. */
export function parseConfig(input: unknown): MultivrsConfig {
  const result = multivrsConfigSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Invalid multivrs.json", result.error.issues);
  }
  return result.data;
}

/** Non-throwing variant for callers that want to branch on the result. */
export function safeParseConfig(input: unknown): SafeParseResult {
  const result = multivrsConfigSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: new ValidationError("Invalid multivrs.json", result.error.issues),
  };
}

/** Parse raw file contents (JSON text) then validate. */
export function parseConfigFromJson(text: string): MultivrsConfig {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new ValidationError("multivrs.json is not valid JSON", String(err));
  }
  return parseConfig(json);
}
