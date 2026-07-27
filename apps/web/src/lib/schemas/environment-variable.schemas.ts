import { z } from "zod";

export const environmentTargetSchema = z.enum([
  "development",
  "preview",
  "production",
]);

export const saveEnvironmentVariableSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
  targets: z.array(environmentTargetSchema).min(1),
  value: z.string().max(20_000),
});

export const environmentVariableIdSchema = z.uuid();
