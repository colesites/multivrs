import type { SwiftRustContainer } from "./runtime-container";

export interface Env {
  ARTIFACTS: R2Bucket;
  CONTROL_PLANE_TOKEN?: string;
  CONTROL_PLANE_URL: string;
  RUNTIME: DurableObjectNamespace<SwiftRustContainer>;
}
