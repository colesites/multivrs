import { z } from "zod";

export const ingestRuntimeLogsSchema = z.object({
  deploymentId: z.string().min(1).max(128),
  logs: z
    .array(
      z.object({
        level: z.enum(["info", "warn", "error"]),
        message: z.string().min(1).max(16_000),
        requestId: z.string().max(128).optional(),
        traceId: z.string().max(128).optional(),
      }),
    )
    .min(1)
    .max(200),
});
