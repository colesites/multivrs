import { z } from "zod";
import {
  type ArtifactMetadataInput,
  artifactMetadataInputSchema,
  type CreateDeploymentInput,
  type CreateDeploymentLogInput,
  type CreateProjectInput,
  createDeploymentInputSchema,
  createDeploymentLogInputSchema,
  createProjectInputSchema,
  type Deployment,
  type DeploymentLog,
  deploymentLogSchema,
  deploymentSchema,
  type PrepareArtifactResponse,
  type Project,
  prepareArtifactResponseSchema,
  projectSchema,
  type UpdateDeploymentStatusInput,
  type UploadDeploymentArtifactInput,
  updateDeploymentStatusInputSchema,
  uploadDeploymentArtifactInputSchema,
} from "./contract";
import { type FetchLike, type RequestContext, request } from "./request";

export interface ClientOptions {
  baseUrl: string;
  token?: string;
  /** Injectable for tests / non-browser runtimes. Defaults to global fetch. */
  fetch?: FetchLike;
}

export interface MultivrsClient {
  createProject(input: CreateProjectInput): Promise<Project>;
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project>;
  createDeployment(projectId: string, input?: CreateDeploymentInput): Promise<Deployment>;
  uploadDeploymentArtifact(
    projectId: string,
    deploymentId: string,
    input: UploadDeploymentArtifactInput,
  ): Promise<Deployment>;
  updateDeploymentStatus(
    projectId: string,
    deploymentId: string,
    input: UpdateDeploymentStatusInput,
  ): Promise<Deployment>;
  appendDeploymentLog(
    projectId: string,
    deploymentId: string,
    input: CreateDeploymentLogInput,
  ): Promise<DeploymentLog>;
  listDeploymentLogs(projectId: string, deploymentId: string): Promise<DeploymentLog[]>;
  prepareDeploymentArtifact(
    projectId: string,
    deploymentId: string,
    input: ArtifactMetadataInput,
  ): Promise<PrepareArtifactResponse>;
  completeDeploymentArtifact(
    projectId: string,
    deploymentId: string,
    input: ArtifactMetadataInput,
  ): Promise<Deployment>;
}

const projectListSchema = z.array(projectSchema);
const deploymentLogListSchema = z.array(deploymentLogSchema);

export function createClient(options: ClientOptions): MultivrsClient {
  const ctx: RequestContext = {
    baseUrl: options.baseUrl.replace(/\/+$/, ""),
    token: options.token,
    fetch: options.fetch ?? globalThis.fetch,
  };

  return {
    createProject(input) {
      const body = createProjectInputSchema.parse(input);
      return request(ctx, "POST", "/api/projects", projectSchema, body);
    },
    listProjects() {
      return request(ctx, "GET", "/api/projects", projectListSchema);
    },
    getProject(id) {
      return request(ctx, "GET", `/api/projects/${id}`, projectSchema);
    },
    createDeployment(projectId, input) {
      const body = createDeploymentInputSchema.parse(input ?? {});
      return request(ctx, "POST", `/api/projects/${projectId}/deployments`, deploymentSchema, body);
    },
    uploadDeploymentArtifact(projectId, deploymentId, input) {
      const body = uploadDeploymentArtifactInputSchema.parse(input);
      return request(
        ctx,
        "POST",
        `/api/projects/${projectId}/deployments/${deploymentId}/artifact`,
        deploymentSchema,
        body,
      );
    },
    updateDeploymentStatus(projectId, deploymentId, input) {
      const body = updateDeploymentStatusInputSchema.parse(input);
      return request(
        ctx,
        "POST",
        `/api/projects/${projectId}/deployments/${deploymentId}/status`,
        deploymentSchema,
        body,
      );
    },
    appendDeploymentLog(projectId, deploymentId, input) {
      const body = createDeploymentLogInputSchema.parse(input);
      return request(
        ctx,
        "POST",
        `/api/projects/${projectId}/deployments/${deploymentId}/logs`,
        deploymentLogSchema,
        body,
      );
    },
    listDeploymentLogs(projectId, deploymentId) {
      return request(
        ctx,
        "GET",
        `/api/projects/${projectId}/deployments/${deploymentId}/logs`,
        deploymentLogListSchema,
      );
    },
    prepareDeploymentArtifact(projectId, deploymentId, input) {
      const body = artifactMetadataInputSchema.parse(input);
      return request(
        ctx,
        "POST",
        `/api/projects/${projectId}/deployments/${deploymentId}/artifact/prepare`,
        prepareArtifactResponseSchema,
        body,
      );
    },
    completeDeploymentArtifact(projectId, deploymentId, input) {
      const body = artifactMetadataInputSchema.parse(input);
      return request(
        ctx,
        "POST",
        `/api/projects/${projectId}/deployments/${deploymentId}/artifact/complete`,
        deploymentSchema,
        body,
      );
    },
  };
}
