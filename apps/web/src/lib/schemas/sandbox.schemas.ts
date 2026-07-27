import { z } from "zod";

export const sandboxIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,126}$/);
export const sandboxCommandSchema = z.object({
  command: z.string().min(1).max(4_000),
});
export const sandboxCreateResponseSchema = z.object({
  sandboxId: sandboxIdSchema,
  status: z.literal("ready"),
});
export const sandboxCommandResponseSchema = z.object({
  exitCode: z.number().nullable().optional(),
  stderr: z.string(),
  stdout: z.string(),
  success: z.boolean(),
});
