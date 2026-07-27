import { z } from "zod";

const ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const ENTRYPOINT_PATTERN = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9_./-]{1,500}$/;
const runtimeSchema = z.enum(["bun", "node", "go", "python", "ruby"]);
const environmentSchema = z.record(
  z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
  z.string().max(20_000),
);

export interface RuntimeRequest {
  deploymentId: string;
  artifactHash: string;
  environment: Record<string, string>;
  entrypoint: string;
  runtime: z.infer<typeof runtimeSchema>;
}

export function parseRuntimeRequest(request: Request): RuntimeRequest | null {
  const deploymentId = request.headers.get("x-multivrs-deployment") ?? "";
  const artifactHash = request.headers.get("x-multivrs-artifact") ?? "";
  const entrypoint = request.headers.get("x-multivrs-entrypoint") ?? "";
  const runtime = runtimeSchema.safeParse(request.headers.get("x-multivrs-runtime"));
  if (
    !ID_PATTERN.test(deploymentId) ||
    !HASH_PATTERN.test(artifactHash) ||
    !ENTRYPOINT_PATTERN.test(entrypoint) ||
    !runtime.success
  ) {
    return null;
  }
  const encoded = request.headers.get("x-multivrs-environment") ?? "e30=";
  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const environment = environmentSchema.parse(JSON.parse(new TextDecoder().decode(bytes)));
    return { deploymentId, artifactHash, entrypoint, environment, runtime: runtime.data };
  } catch {
    return null;
  }
}
