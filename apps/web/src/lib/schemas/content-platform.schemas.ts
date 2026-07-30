import { z } from "zod";

const pathPattern = z.string().startsWith("/").max(1_000);

export const updateContentSettingsSchema = z.object({
  defaultRevalidate: z.number().int().min(1).max(31_536_000),
  staleWindow: z.number().int().min(0).max(31_536_000),
});

export const createBulkRedirectSchema = z.object({
  destination: z.string().min(1).max(2_000),
  enabled: z.boolean().default(true),
  preserveQuery: z.boolean().default(true),
  priority: z.number().int().min(0).max(100_000).default(0),
  source: pathPattern,
  statusCode: z.union([
    z.literal(301),
    z.literal(302),
    z.literal(307),
    z.literal(308),
  ]),
});

export const updateBulkRedirectSchema = createBulkRedirectSchema.partial();

export const setEdgeConfigEntrySchema = z.object({
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/),
  value: z.json(),
});

export const createMicrofrontendRouteSchema = z.object({
  enabled: z.boolean().default(true),
  priority: z.number().int().min(0).max(100_000).default(0),
  source: pathPattern,
  stripPrefix: z.boolean().default(false),
  targetProjectId: z.uuid(),
});

export const updateMicrofrontendRouteSchema =
  createMicrofrontendRouteSchema.partial();

export const prepareBlobUploadSchema = z.object({
  contentType: z.string().min(1).max(255),
  pathname: z
    .string()
    .min(1)
    .max(1_000)
    .transform((value) => value.replace(/^\/+/, ""))
    .refine((value) => value.length > 0 && !value.split("/").includes("..")),
  size: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024 * 1024),
  visibility: z.enum(["public", "private"]).default("public"),
});

export const revalidateCacheSchema = z.object({
  tag: z.string().min(1).max(128).optional(),
});
