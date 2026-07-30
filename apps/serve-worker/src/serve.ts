import { collectAnalyticsEvent } from "./analytics-events";
import { isBlobRequest, serveBlob } from "./blob";
import { releaseCacheLock, serveFunctionWithCache, storeGeneratedResponse } from "./cache";
import { contentType } from "./content-type";
import {
  type ControlResolution,
  encodeRuntimeEnvironment,
  resolveDeployment,
  resolveProjectDeployment,
} from "./control";
import { enforceFirewall } from "./firewall";
import { serveImage } from "./image";
import { collectVital, insightsScript, instrumentHtml } from "./insights";
import { resolveRequest, selectAssetVariant } from "./resolve";
import { applyBulkRedirects, resolveMicrofrontend } from "./routing";
import { loadRuntimeConfig } from "./runtime-config";
import type { ArtifactManifest, BuildFunction, Env, RevalidationMessage } from "./types";
import { recordUsage } from "./usage";

export interface ServedDeployment extends ControlResolution {
  response: Response;
}

export async function serveDeployment(
  request: Request,
  env: Env,
  context: ExecutionContext,
): Promise<ServedDeployment> {
  return serveResolvedDeployment(request, env, context, await resolveDeployment(request, env));
}

async function serveResolvedDeployment(
  request: Request,
  env: Env,
  context: ExecutionContext,
  deployment: ControlResolution,
): Promise<ServedDeployment> {
  const firewallResponse = await enforceFirewall(request, env, deployment);
  if (firewallResponse) return { ...deployment, response: firewallResponse };
  const pathname = new URL(request.url).pathname;
  if (pathname === "/_multivrs/analytics.js" || pathname === "/_multivrs/insights.js") {
    return { ...deployment, response: insightsScript() };
  }
  if (pathname === "/_multivrs/events" && request.method === "POST") {
    return { ...deployment, response: await collectAnalyticsEvent(request, env, deployment) };
  }
  if (pathname === "/_multivrs/vitals" && request.method === "POST") {
    return { ...deployment, response: await collectVital(request, env, deployment) };
  }
  if (isBlobRequest(pathname)) {
    return { ...deployment, response: await serveBlob(request, env, deployment) };
  }

  const runtimeConfig = await loadRuntimeConfig(env, context, deployment);
  if (pathname.startsWith("/_multivrs/edge-config/")) {
    const key = decodeURIComponent(pathname.slice("/_multivrs/edge-config/".length));
    if (!Object.hasOwn(runtimeConfig.edgeConfig, key)) {
      return result(deployment, "Edge Config key not found", 404);
    }
    recordUsage(env, deployment.projectId, "edge_config_reads");
    return {
      ...deployment,
      response: Response.json(runtimeConfig.edgeConfig[key], {
        headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" },
      }),
    };
  }

  const redirect = applyBulkRedirects(request, runtimeConfig);
  if (redirect) return { ...deployment, response: redirect };

  const hop = Number(request.headers.get("x-multivrs-microfrontend-hop") ?? 0);
  if (hop < 4) {
    const mounted = resolveMicrofrontend(request, runtimeConfig);
    if (mounted) {
      const target = await resolveProjectDeployment(mounted.targetProjectId, env);
      const served = await serveResolvedDeployment(mounted.request, env, context, target);
      const headers = new Headers(served.response.headers);
      headers.set("x-multivrs-microfrontend", mounted.targetProjectId);
      recordUsage(env, deployment.projectId, "microfrontend_routing");
      return {
        ...deployment,
        response: new Response(served.response.body, {
          headers,
          status: served.response.status,
          statusText: served.response.statusText,
        }),
      };
    }
  }

  const manifest = await loadManifest(env, deployment);
  if (!manifest) return result(deployment, "Deployment artifact not found", 404);
  if (pathname === "/_image") {
    return {
      ...deployment,
      response: await serveImage(
        request,
        env,
        context,
        manifest,
        deployment.artifactHash,
        deployment.projectId,
      ),
    };
  }
  const resolved = resolveRequest(manifest, pathname);
  if (!resolved) return result(deployment, "Not found", 404);
  if (resolved.type === "function") {
    const response = await serveFunctionWithCache(
      request,
      env,
      context,
      deployment,
      runtimeConfig,
      {
        generate: () =>
          invokeFunctionResponse(request, env, deployment, manifest, resolved.function),
      },
    );
    return { ...deployment, response };
  }
  const file = selectAssetVariant(manifest, resolved.file, request.headers.get("accept") ?? "");
  return {
    ...deployment,
    response: instrumentHtml(
      await serveStatic(request, env, context, deployment, file),
      deployment,
    ),
  };
}

async function loadManifest(
  env: Env,
  deployment: ControlResolution,
): Promise<ArtifactManifest | null> {
  const object = await env.ARTIFACTS.get(`artifacts/${deployment.artifactHash}/manifest.json`);
  return object ? object.json<ArtifactManifest>() : null;
}

async function serveStatic(
  request: Request,
  env: Env,
  context: ExecutionContext,
  deployment: ControlResolution,
  file: ArtifactManifest["files"][number],
): Promise<Response> {
  const cacheUrl = new URL(request.url);
  cacheUrl.search = "";
  cacheUrl.searchParams.set("multivrs-asset", file.hash);
  const cacheKey = new Request(cacheUrl, { method: "GET" });
  if (request.method === "GET" && deployment.cacheMode !== "bypass") {
    const cached = await caches.default.match(cacheKey);
    if (cached) return cached;
  }
  const object = await env.ARTIFACTS.get(`blobs/${file.hash}`);
  if (!object) return new Response("Artifact blob not found", { status: 404 });
  const response = new Response(object.body, {
    headers: {
      "cache-control": cacheControl(deployment, file.path),
      "content-length": String(file.size),
      "content-type": contentType(file.path),
      etag: file.hash,
      vary: "Accept",
    },
  });
  if (request.method === "GET" && deployment.cacheMode !== "bypass") {
    context.waitUntil(caches.default.put(cacheKey, response.clone()));
  }
  return response;
}

async function invokeFunctionResponse(
  request: Request,
  env: Env,
  deployment: ControlResolution,
  manifest: ArtifactManifest,
  fn: BuildFunction,
): Promise<Response> {
  const entrypoint = manifest.files.find((file) => file.path === fn.entrypoint);
  if (!entrypoint) return new Response("Function artifact not found", { status: 502 });
  const forwarded = new Request(request);
  forwarded.headers.delete("x-multivrs-firewall-bypass");
  forwarded.headers.set("x-multivrs-artifact", deployment.artifactHash);
  forwarded.headers.set("x-multivrs-deployment", deployment.deploymentId);
  forwarded.headers.set("x-multivrs-entrypoint", fn.entrypoint);
  forwarded.headers.set("x-multivrs-function", fn.name);
  forwarded.headers.set(
    "x-multivrs-request-id",
    request.headers.get("x-multivrs-request-id") ?? crypto.randomUUID(),
  );
  forwarded.headers.set("x-multivrs-runtime", fn.runtime);
  forwarded.headers.set(
    "x-multivrs-environment",
    encodeRuntimeEnvironment(deployment.runtimeEnvironment),
  );
  forwarded.headers.set("x-forwarded-host", new URL(request.url).host);
  forwarded.headers.set("x-forwarded-proto", new URL(request.url).protocol.slice(0, -1));
  let response: Response;
  const startedAt = Date.now();
  if (fn.runtime === "edge" && env.DISPATCHER) {
    response = await env.DISPATCHER.get(deployment.deploymentId).fetch(forwarded);
  } else if (env.COMPUTE) {
    response = await env.COMPUTE.fetch(forwarded);
  } else if (fn.runtime === "node" || fn.runtime === "bun") {
    const incoming = new URL(request.url);
    const endpoint = new URL(
      `/api/deployments/${deployment.deploymentId}/serve${incoming.pathname}`,
      env.CONTROL_PLANE_URL,
    );
    endpoint.search = incoming.search;
    response = await fetch(new Request(endpoint, forwarded));
  } else {
    return new Response("Deployment compute is unavailable", { status: 503 });
  }
  recordUsage(env, deployment.projectId, "function_invocations");
  recordUsage(env, deployment.projectId, "function_duration_ms", Date.now() - startedAt, [
    fn.runtime,
  ]);
  const upstream = instrumentHtml(
    meterOriginTransfer(response, env, deployment.projectId),
    deployment,
  );
  const headers = new Headers(upstream.headers);
  if (deployment.cacheMode === "bypass") {
    headers.set("cache-control", "private, no-store");
  } else if (deployment.cacheMode === "aggressive") {
    headers.set("cache-control", cacheControl(deployment));
  } else if (!headers.has("cache-control")) {
    headers.set("cache-control", "private, no-store");
  }
  return new Response(upstream.body, {
    headers,
    status: upstream.status,
    statusText: upstream.statusText,
  });
}

function meterOriginTransfer(response: Response, env: Env, projectId: string): Response {
  if (!response.body) return response;
  let bytes = 0;
  const measured = response.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      flush() {
        recordUsage(env, projectId, "fast_origin_transfer", bytes);
      },
      transform(chunk, controller) {
        bytes += chunk.byteLength;
        controller.enqueue(chunk);
      },
    }),
  );
  return new Response(measured, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export async function processRevalidation(
  message: RevalidationMessage,
  env: Env,
  context: ExecutionContext,
): Promise<void> {
  try {
    const deployment = await resolveProjectDeployment(message.projectId, env);
    const manifest = await loadManifest(env, deployment);
    if (!manifest) throw new Error("Deployment artifact not found during revalidation");
    const request = new Request(message.requestUrl, {
      headers: new Headers(message.requestHeaders),
      method: "GET",
    });
    const resolved = resolveRequest(manifest, new URL(request.url).pathname);
    if (resolved?.type !== "function") return;
    const config = await loadRuntimeConfig(env, context, deployment);
    const response = await invokeFunctionResponse(
      request,
      env,
      deployment,
      manifest,
      resolved.function,
    );
    await storeGeneratedResponse(env, deployment, config, message.cacheKey, response);
  } finally {
    await releaseCacheLock(env, message.cacheKey, message.lockOwner);
  }
}

function result(deployment: ControlResolution, body: string, status: number): ServedDeployment {
  return { ...deployment, response: new Response(body, { status }) };
}

function cacheControl(deployment: ControlResolution, path?: string): string {
  if (deployment.cacheMode === "bypass") return "private, no-store";
  const immutable = path && !path.endsWith(".html") && deployment.cacheMode === "smart";
  if (immutable) return "public, max-age=31536000, immutable";
  return `public, max-age=${deployment.browserTtl}, s-maxage=${deployment.edgeTtl}, stale-while-revalidate=${deployment.staleWindow}`;
}
