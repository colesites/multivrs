import { z } from "zod";

export const apiTokenSummarySchema = z.object({
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  hint: z.string(),
  id: z.string(),
  lastUsedAt: z.string().nullable(),
  name: z.string(),
});

export const createdApiTokenSchema = z.object({
  apiToken: apiTokenSummarySchema,
  token: z.string().startsWith("mvrs_"),
});
