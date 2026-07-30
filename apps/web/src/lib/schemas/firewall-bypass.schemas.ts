import { z } from "zod";

export const createFirewallBypassSchema = z.object({
  pathPrefix: z.string().startsWith("/").max(2_000).default("/"),
  ttlMinutes: z.number().int().min(1).max(1_440).default(60),
});
