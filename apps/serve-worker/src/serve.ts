import { contentType } from "./content-type";
import { type ControlResolution, encodeRuntimeEnvironment, resolveDeployment } from "./control";
import { enforceFirewall } from "./firewall";
import { serveImage } from "./image";
import { collectVital, insightsScript, instrumentHtml } from "./insights";
import { resolveRequest, selectAssetVariant } from "./resolve";
import type { ArtifactManifest, BuildFunction, Env } from "./types";

export interface ServedDeployment extends ControlResolution {
  response: Response;
}

export async function serveDeployment(
  request: Request,
  env: Env,
  context: ExecutionContext,
): Promise<ServedDeployment> {
  const deployment = await resolveDeployment(request, env);
  const firewallResponse = await enforceFirewall(request, env, deployment);
  if (firewallResponse) return { ...deployment, response: firewallResponse };
  const pathname = new URL(request.url).pathname;
  if (pathname === "/_multivrs/insights.js") {
    return { ...deployment, response: insightsScript() };
  }
  if (pathname === "/_multivrs/vitals" && request.method === "POST") {
    return { ...deployment, response: await collectVital(request, env, deployment) };
  }
  const manifestObject = await env.ARTIFACTS.get(
    `artifacts/${deployment.artifactHash}/manifest.json`,
  );
  if (!manifestObject) return result(deployment, "Deployment artifact not found", 404);
  const manifest = await manifestObject.json<ArtifactManifest>();
  if (pathname === "/_image") {
    return {
      ...deployment,
      response: await serveImage(request, env, context, manifest, deployment.artifactHash),
    };
  }
  const resolved = resolveRequest(manifest, pathname);
  if (!resolved) return result(deployment, "Not found", 404);
  if (resolved.type === "function") {
    return invokeFunction(request, env, deployment, manifest, resolved.function);
  }
  const file = selectAssetVariant(manifest, resolved.file, request.headers.get("accept") ?? "");
  const object = await env.ARTIFACTS.get(`blobs/${file.hash}`);
  if (!object) return result(deployment, "Artifact blob not found", 404);
  return {
    ...deployment,
    response: instrumentHtml(
      new Response(object.body, {
        headers: {
          "cache-control": cacheControl(deployment, file.path),
          "content-type": contentType(file.path),
          etag: file.hash,
          vary: "Accept",
        },
      }),
    ),
  };
}

function invokeFunction(
  request: Request,
  env: Env,
  deployment: ControlResolution,
  manifest: ArtifactManifest,
  fn: BuildFunction,
): ServedDeployment | Promise<ServedDeployment> {
  const entrypoint = manifest.files.find((file) => file.path === fn.entrypoint);
  if (!entrypoint) return result(deployment, "Function artifact not found", 502);
  const forwarded = new Request(request);
  forwarded.headers.set("x-multivrs-artifact", deployment.artifactHash);
  forwarded.headers.set("x-multivrs-deployment", deployment.deploymentId);
  forwarded.headers.set("x-multivrs-entrypoint", fn.entrypoint);
  forwarded.headers.set("x-multivrs-function", fn.name);
  forwarded.headers.set("x-multivrs-runtime", fn.runtime);
  forwarded.headers.set(
    "x-multivrs-environment",
    encodeRuntimeEnvironment(deployment.runtimeEnvironment),
  );
  forwarded.headers.set("x-forwarded-host", new URL(request.url).host);
  forwarded.headers.set("x-forwarded-proto", new URL(request.url).protocol.slice(0, -1));
  if (fn.runtime === "edge" && env.DISPATCHER) {
    return wrap(deployment, env.DISPATCHER.get(deployment.deploymentId).fetch(forwarded));
  }
  if (env.COMPUTE) return wrap(deployment, env.COMPUTE.fetch(forwarded));
  if (fn.runtime === "node" || fn.runtime === "bun") {
    const incoming = new URL(request.url);
    const endpoint = new URL(
      `/api/deployments/${deployment.deploymentId}/serve${incoming.pathname}`,
      env.CONTROL_PLANE_URL,
    );
    endpoint.search = incoming.search;
    return wrap(deployment, fetch(new Request(endpoint, forwarded)));
  }
  return result(deployment, "Deployment compute is unavailable", 503);
}

function result(deployment: ControlResolution, body: string, status: number): ServedDeployment {
  return { ...deployment, response: new Response(body, { status }) };
}

async function wrap(
  deployment: ControlResolution,
  response: Promise<Response>,
): Promise<ServedDeployment> {
  const upstream = instrumentHtml(await response);
  const headers = new Headers(upstream.headers);
  if (deployment.cacheMode === "bypass") {
    headers.set("cache-control", "private, no-store");
  } else if (deployment.cacheMode === "aggressive") {
    headers.set("cache-control", cacheControl(deployment));
  } else if (!headers.has("cache-control")) {
    headers.set("cache-control", "private, no-store");
  }
  return {
    ...deployment,
    response: new Response(upstream.body, {
      headers,
      status: upstream.status,
      statusText: upstream.statusText,
    }),
  };
}

function cacheControl(deployment: ControlResolution, path?: string): string {
  if (deployment.cacheMode === "bypass") return "private, no-store";
  const immutable = path && !path.endsWith(".html") && deployment.cacheMode === "smart";
  if (immutable) return "public, max-age=31536000, immutable";
  return `public, max-age=${deployment.browserTtl}, s-maxage=${deployment.edgeTtl}`;
}
