import { z } from "zod";

export const createEmailRouteSchema = z.object({
  destination: z.email().max(320),
  projectId: z.uuid().nullable().optional(),
  source: z.email().max(320),
});

export const updateEmailRouteSchema = z.object({ enabled: z.boolean() });
export const emailRouteIdSchema = z.uuid();
