import type { Sandbox } from "@cloudflare/sandbox";
import type { BuildJob } from "@multivrs/client";

export interface BuildWorkerEnv {
  BUILD_CACHE: R2Bucket;
  BUILD_QUEUE: Queue<BuildJob>;
  BUILD_WORKER_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  DISPATCH_NAMESPACE?: string;
  Sandbox: DurableObjectNamespace<Sandbox>;
  SANDBOX_TRANSPORT: string;
}

export class BuildCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuildCommandError";
  }
}
