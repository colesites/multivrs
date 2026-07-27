import { z } from "zod";

export const oidcTokenRequestSchema = z.object({
  audience: z.string().min(1).max(500).default("multivrs"),
});

export const oidcTokenResponseSchema = z.object({
  expiresAt: z.string(),
  token: z.string().min(1),
});
