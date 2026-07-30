import { z } from "zod";

export const deploymentUsageSchema = z.object({
  metric: z.enum([
    "build_cache_read_bytes",
    "build_cache_write_bytes",
    "build_duration_ms_standard",
  ]),
  quantity: z.number().int().nonnegative(),
});
