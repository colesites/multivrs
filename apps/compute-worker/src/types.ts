import type { SwiftRustContainer } from "./runtime-container";

export interface Env {
  ARTIFACTS: R2Bucket;
  RUNTIME: DurableObjectNamespace<SwiftRustContainer>;
}
