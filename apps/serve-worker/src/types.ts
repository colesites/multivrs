export interface ArtifactFile {
  path: string;
  hash: string;
  size: number;
}

export interface BuildFunction {
  name: string;
  entrypoint: string;
  runtime: "bun" | "node" | "edge" | "go" | "python" | "ruby";
}

export interface ArtifactManifest {
  hash: string;
  files: ArtifactFile[];
  output?: {
    staticDir?: string;
    functions: BuildFunction[];
    routes: Array<{
      src: string;
      target: { type: "static" } | { type: "function"; function: string };
    }>;
  };
}

export interface Env {
  ANALYTICS?: AnalyticsEngineDataset;
  ARTIFACTS: R2Bucket;
  BLOB_SIGNING_SECRET?: string;
  CACHE_COORDINATOR?: DurableObjectNamespace<import("./cache-coordinator").CacheCoordinator>;
  CONTENT?: R2Bucket;
  CONTROL_PLANE_URL: string;
  CONTROL_PLANE_TOKEN?: string;
  FIREWALL_BYPASS_SECRET?: string;
  COMPUTE?: Fetcher;
  DISPATCHER?: {
    get(name: string): Fetcher;
  };
  IMAGES?: ImagesBinding;
  RATE_LIMITER?: RateLimit;
  REVALIDATION_QUEUE?: Queue<RevalidationMessage>;
  RUNTIME_CONFIG?: KVNamespace;
  USAGE_ANALYTICS?: AnalyticsEngineDataset;
  WORKFLOW_CONTROL_SECRET?: string;
  WORKFLOWS: Workflow<import("./platform-workflow").PlatformWorkflowPayload>;
}

export interface RevalidationMessage {
  cacheKey: string;
  lockOwner: string;
  projectId: string;
  requestHeaders: Array<[string, string]>;
  requestUrl: string;
}

export type ResolvedRequest =
  | { type: "static"; file: ArtifactFile }
  | { type: "function"; function: BuildFunction };
