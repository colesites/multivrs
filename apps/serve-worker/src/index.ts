import { contentType } from "./content-type";
import { resolveRequest, selectAssetVariant } from "./resolve";
import type { ArtifactManifest, Env } from "./types";

interface ControlResolution {
  deploymentId: string;
  artifactHash: string;
}

async function resolveDeployment(request: Request, env: Env): Promise<ControlResolution> {
  const endpoint = new URL("/api/serve/resolve", env.CONTROL_PLANE_URL);
  endpoint.searchParams.set("hostname", new URL(request.url).hostname);
  const headers = new Headers();
  if (env.CONTROL_PLANE_TOKEN) {
    headers.set("authorization", `Bearer ${env.CONTROL_PLANE_TOKEN}`);
  }
  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    throw new Error(`control plane returned ${response.status}`);
  }
  return response.json<ControlResolution>();
}

async function serve(request: Request, env: Env): Promise<Response> {
  const deployment = await resolveDeployment(request, env);
  const manifestObject = await env.ARTIFACTS.get(
    `artifacts/${deployment.artifactHash}/manifest.json`,
  );
  if (!manifestObject) {
    return new Response("Deployment artifact not found", { status: 404 });
  }
  const manifest = await manifestObject.json<ArtifactManifest>();
  const resolved = resolveRequest(manifest, new URL(request.url).pathname);
  if (!resolved) {
    return new Response("Not found", { status: 404 });
  }
  if (resolved.type === "function") {
    if (!env.COMPUTE) {
      return new Response("Deployment compute is unavailable", { status: 503 });
    }
    const forwarded = new Request(request);
    forwarded.headers.set("x-multivrs-deployment", deployment.deploymentId);
    forwarded.headers.set("x-multivrs-function", resolved.function.name);
    return env.COMPUTE.fetch(forwarded);
  }
  const file = selectAssetVariant(manifest, resolved.file, request.headers.get("accept") ?? "");
  const object = await env.ARTIFACTS.get(`blobs/${file.hash}`);
  if (!object) {
    return new Response("Artifact blob not found", { status: 404 });
  }
  return new Response(object.body, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-type": contentType(file.path),
      etag: file.hash,
      vary: "Accept",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await serve(request, env);
    } catch {
      return new Response("Deployment resolution failed", { status: 502 });
    }
  },
} satisfies ExportedHandler<Env>;
