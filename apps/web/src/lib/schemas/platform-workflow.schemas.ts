import { z } from "zod";

const stepNameSchema = z.string().trim().min(1).max(80);
const workflowHeadersSchema = z
  .record(z.string().trim().min(1).max(100), z.string().max(4_096))
  .refine((headers) => Object.keys(headers).length <= 30, "Too many headers");

export const platformWorkflowStepSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("http"),
    name: stepNameSchema,
    url: z.url().max(2_048),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("POST"),
    headers: workflowHeadersSchema.default({}),
    body: z.string().max(256_000).optional(),
    retries: z.number().int().min(0).max(5).default(2),
    timeoutSeconds: z.number().int().min(1).max(300).default(30),
  }),
  z.object({
    type: z.literal("delay"),
    name: stepNameSchema,
    durationSeconds: z.number().int().min(1).max(2_592_000),
  }),
]);

export const createPlatformWorkflowSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  enabled: z.boolean().default(true),
  steps: z.array(platformWorkflowStepSchema).min(1).max(50),
  cron: z.string().trim().min(9).max(100).optional(),
});

export const runPlatformWorkflowSchema = z.object({
  input: z.json().optional(),
});

export const internalWorkflowStatusSchema = z.object({
  runId: z.uuid(),
  instanceId: z.string().min(1).max(100),
  status: z.enum(["running", "complete", "errored", "terminated"]),
  output: z.json().optional(),
  errorMessage: z.string().max(4_000).optional(),
});

export type PlatformWorkflowStep = z.infer<typeof platformWorkflowStepSchema>;
export type CreatePlatformWorkflowInput = z.infer<
  typeof createPlatformWorkflowSchema
>;
