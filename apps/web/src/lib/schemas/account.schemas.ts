import { z } from "zod";

export const accountProfileSchema = z.object({
  image: z.url().max(2_048).nullable().optional(),
  name: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores"),
});

export const accountProfileResponseSchema = accountProfileSchema.extend({
  email: z.email(),
});

export type AccountProfileInput = z.infer<typeof accountProfileSchema>;
export type AccountProfile = z.infer<typeof accountProfileResponseSchema>;
