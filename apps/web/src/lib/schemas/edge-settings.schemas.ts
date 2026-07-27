import { z } from "zod";

export const updateEdgeSettingsSchema = z.object({
  analyticsEnabled: z.boolean(),
  attackMode: z.boolean(),
  browserTtl: z.number().int().min(0).max(31_536_000),
  cacheMode: z.enum(["smart", "bypass", "aggressive"]),
  edgeTtl: z.number().int().min(0).max(31_536_000),
  speedInsightsEnabled: z.boolean(),
});
