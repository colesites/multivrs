export interface ArtifactFile {
  path: string;
  hash: string;
  size: number;
}

export interface BuildFunction {
  name: string;
  entrypoint: string;
  runtime: "bun" | "node" | "edge";
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
  ARTIFACTS: R2Bucket;
  CONTROL_PLANE_URL: string;
  CONTROL_PLANE_TOKEN?: string;
  COMPUTE?: Fetcher;
}

export type ResolvedRequest =
  | { type: "static"; file: ArtifactFile }
  | { type: "function"; function: BuildFunction };
