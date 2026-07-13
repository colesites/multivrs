/**
 * The control-plane API contract — single source of truth for the wire shapes
 * of Project / Deployment / Domain and their create-inputs. Both the typed
 * client and the `apps/web` API routes import these schemas, so request
 * validation and response parsing can never drift apart.
 *
 * Timestamps are ISO strings over the wire (JSON has no Date).
 */
import { FRAMEWORK_IDS, RENDER_MODES, RUNTIMES } from "@multivrs/config";
import { z } from "zod";

export const DEPLOYMENT_STATUSES = ["queued", "building", "ready", "error", "canceled"] as const;
export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];
export const DEPLOYMENT_TARGETS = ["preview", "production"] as const;
export type DeploymentTarget = (typeof DEPLOYMENT_TARGETS)[number];

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  framework: z.enum(FRAMEWORK_IDS).nullable(),
  ownerId: z.string(),
  productionDeploymentId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof projectSchema>;

export const createProjectInputSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(SLUG_PATTERN, "slug must be kebab-case").optional(),
  framework: z.enum(FRAMEWORK_IDS).nullable().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const deploymentSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  status: z.enum(DEPLOYMENT_STATUSES),
  target: z.enum(DEPLOYMENT_TARGETS).default("preview"),
  renderMode: z.enum(RENDER_MODES).nullable(),
  commitSha: z.string().nullable(),
  branch: z.string().nullable(),
  artifactHash: z.string().nullable(),
  url: z.string().nullable(),
  startedAt: z.string().nullable().optional(),
  finishedAt: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Deployment = z.infer<typeof deploymentSchema>;

export const createDeploymentInputSchema = z.object({
  branch: z.string().optional(),
  commitSha: z.string().optional(),
  renderMode: z.enum(RENDER_MODES).optional(),
  target: z.enum(DEPLOYMENT_TARGETS).default("preview"),
});
export type CreateDeploymentInput = z.infer<typeof createDeploymentInputSchema>;

export const updateDeploymentStatusInputSchema = z.object({
  status: z.enum(["building", "error", "canceled"]),
  message: z.string().max(2_000).optional(),
});
export type UpdateDeploymentStatusInput = z.infer<typeof updateDeploymentStatusInputSchema>;

export const deploymentLogSchema = z.object({
  id: z.string(),
  deploymentId: z.string(),
  level: z.enum(["info", "warn", "error"]),
  message: z.string(),
  createdAt: z.string(),
});
export type DeploymentLog = z.infer<typeof deploymentLogSchema>;

export const createDeploymentLogInputSchema = z.object({
  level: z.enum(["info", "warn", "error"]).default("info"),
  message: z.string().min(1).max(20_000),
});
export type CreateDeploymentLogInput = z.infer<typeof createDeploymentLogInputSchema>;

const serveTargetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("static") }),
  z.object({ type: z.literal("function"), function: z.string().min(1) }),
]);

export const buildOutputSchema = z.object({
  framework: z.enum(FRAMEWORK_IDS),
  staticDir: z.string(),
  functions: z.array(
    z.object({
      name: z.string().min(1),
      entrypoint: z.string().min(1),
      runtime: z.enum(RUNTIMES),
      renderMode: z.enum(RENDER_MODES).optional(),
    }),
  ),
  routes: z.array(
    z.object({
      src: z.string().min(1),
      target: serveTargetSchema,
    }),
  ),
});
export type BuildOutputInput = z.infer<typeof buildOutputSchema>;

const artifactFileMetadataSchema = z.object({
  path: z.string().min(1),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  size: z.number().int().nonnegative(),
});

export const artifactMetadataInputSchema = z.object({
  artifactHash: z.string().regex(/^[a-f0-9]{64}$/),
  target: z.enum(DEPLOYMENT_TARGETS).default("preview"),
  output: buildOutputSchema,
  files: z.array(artifactFileMetadataSchema).min(1),
});
export type ArtifactMetadataInput = z.infer<typeof artifactMetadataInputSchema>;

export const prepareArtifactResponseSchema = z.object({
  uploads: z.array(z.object({ hash: z.string(), url: z.string() })),
});
export type PrepareArtifactResponse = z.infer<typeof prepareArtifactResponseSchema>;

export const uploadDeploymentArtifactInputSchema = artifactMetadataInputSchema.extend({
  files: z.array(artifactFileMetadataSchema.extend({ contentsBase64: z.string() })).min(1),
});
export type UploadDeploymentArtifactInput = z.infer<typeof uploadDeploymentArtifactInputSchema>;
