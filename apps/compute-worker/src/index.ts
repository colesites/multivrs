import { getContainer } from "@cloudflare/containers";
import { loadArtifact } from "./artifact";
import { parseRuntimeRequest } from "./request";
import { SwiftRustContainer } from "./runtime-container";
import type { Env } from "./types";

export { SwiftRustContainer };

async function invoke(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
  const runtimeRequest = parseRuntimeRequest(request);
  if (!runtimeRequest) {
    return new Response("Invalid runtime request", { status: 400 });
  }
  const container = getContainer(env.RUNTIME, runtimeRequest.deploymentId);
  const ready = await container.ensureRuntime(runtimeRequest);
  if (!ready) {
    const manifest = await loadArtifact(env, runtimeRequest.artifactHash);
    if (!manifest.files.some((file) => file.path === runtimeRequest.entrypoint)) {
      return new Response("Runtime entrypoint not found", { status: 404 });
    }
    await container.prepareRuntime();
    for (const file of manifest.files) {
      const object = await env.ARTIFACTS.get(`blobs/${file.hash}`);
      if (!object?.body)
        return new Response(`Runtime file not found: ${file.path}`, { status: 404 });
      await container.installFile(file.path, object.body);
    }
    await container.activateRuntime(runtimeRequest);
  }
  const response = await container.fetch(request);
  context.waitUntil(container.flushRuntimeLogs());
  return response;
}

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    try {
      return await invoke(request, env, context);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Runtime failed";
      return Response.json({ error: message }, { status: 502 });
    }
  },
} satisfies ExportedHandler<Env>;
