import { z } from "zod";

export const createLogDrainSchema = z.object({
  endpoint: z.url().max(2_048),
  name: z.string().trim().min(1).max(80),
  secret: z.string().min(32).max(500),
});
