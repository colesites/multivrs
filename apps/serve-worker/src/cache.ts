import type { RuntimeProjectConfig } from "@multivrs/routing-utils";
import type { ControlResolution } from "./control";
import type { Env, RevalidationMessage } from "./types";
import { recordUsage } from "./usage";

interface CachedMetadata {
  createdAt: number;
  freshUntil: number;
  headers: Record<string, string>;
  status: number;
  staleUntil: number;
  tags: string[];
  tagVersions: Record<string, string>;
}

interface CachePolicy {
  freshSeconds: number;
  staleSeconds: number;
  tags: string[];
}

export interface CacheGeneration {
  generate(): Promise<Response>;
}

function parseSeconds(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
}

function directive(header: string, name: string): number | null {
  const match = header.match(new RegExp(`(?:^|,)\\s*${name}=(?:"([0-9]+)"|([0-9]+))`, "i"));
  return parseSeconds(match?.[1] ?? match?.[2] ?? null);
}

function policy(response: Response, deployment: ControlResolution): CachePolicy | null {
  if (response.status !== 200) return null;
  const cacheControl = response.headers.get("cache-control") ?? "";
  if (/\b(?:private|no-store)\b/i.test(cacheControl)) return null;
  const explicit = parseSeconds(response.headers.get("x-multivrs-revalidate"));
  const sMaxAge = directive(cacheControl, "s-maxage");
  const frameworkCache = response.headers.has("x-nextjs-cache");
  if (
    deployment.cacheMode === "smart" &&
    explicit === null &&
    sMaxAge === null &&
    !frameworkCache &&
    !/\bpublic\b/i.test(cacheControl)
  ) {
    return null;
  }
  const freshSeconds = explicit ?? sMaxAge ?? deployment.defaultRevalidate;
  const staleSeconds = directive(cacheControl, "stale-while-revalidate") ?? deployment.staleWindow;
  const tags = (response.headers.get("x-multivrs-cache-tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 32);
  return { freshSeconds, staleSeconds, tags };
}

function responseHeaders(response: Response): Record<string, string> {
  const allowed = [
    "cache-control",
    "content-language",
    "content-type",
    "etag",
    "last-modified",
    "vary",
  ];
  return Object.fromEntries(
    allowed.flatMap((name) => {
      const value = response.headers.get(name);
      return value ? [[name, value] as const] : [];
    }),
  );
}

function cleanResponse(response: Response, cacheStatus: string): Response {
  const headers = new Headers(response.headers);
  for (const name of [...headers.keys()]) {
    if (name.startsWith("x-multivrs-cache-") || name === "x-multivrs-revalidate") {
      headers.delete(name);
    }
  }
  headers.set("x-multivrs-cache", cacheStatus);
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function functionCacheKey(
  request: Request,
  deployment: ControlResolution,
): Promise<string> {
  const url = new URL(request.url);
  const vary = [request.headers.get("accept") ?? "", request.headers.get("accept-language") ?? ""];
  return `isr/${deployment.projectId}/${deployment.cacheVersion}/${await digest(
    `${deployment.deploymentId}:${url.pathname}${url.search}:${vary.join(":")}`,
  )}`;
}

function metadata(object: R2ObjectBody): CachedMetadata | null {
  const raw = object.customMetadata?.cache;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedMetadata;
    return Number.isFinite(parsed.freshUntil) && Number.isFinite(parsed.staleUntil) ? parsed : null;
  } catch {
    return null;
  }
}

function tagsCurrent(meta: CachedMetadata, config: RuntimeProjectConfig): boolean {
  return meta.tags.every(
    (tag) => (config.cacheTagVersions[tag] ?? "0") === (meta.tagVersions[tag] ?? "0"),
  );
}

async function readCache(
  env: Env,
  cacheKey: string,
  config: RuntimeProjectConfig,
): Promise<{ response: Response; state: "fresh" | "stale" } | null> {
  const object = await env.CONTENT?.get(cacheKey);
  if (!object?.body) return null;
  const meta = metadata(object);
  if (!meta || !tagsCurrent(meta, config) || meta.staleUntil < Date.now()) return null;
  const headers = new Headers(meta.headers);
  headers.set("age", String(Math.max(0, Math.floor((Date.now() - meta.createdAt) / 1000))));
  const state = meta.freshUntil >= Date.now() ? "fresh" : "stale";
  return {
    response: new Response(object.body, { headers, status: meta.status }),
    state,
  };
}

async function acquire(env: Env, cacheKey: string, owner: string): Promise<boolean> {
  if (!env.CACHE_COORDINATOR) return true;
  return env.CACHE_COORDINATOR.getByName(cacheKey).tryAcquire(owner, 60_000);
}

export async function releaseCacheLock(env: Env, cacheKey: string, owner: string): Promise<void> {
  if (!env.CACHE_COORDINATOR) return;
  await env.CACHE_COORDINATOR.getByName(cacheKey).release(owner);
}

export async function storeGeneratedResponse(
  env: Env,
  deployment: ControlResolution,
  config: RuntimeProjectConfig,
  cacheKey: string,
  response: Response,
): Promise<boolean> {
  if (!env.CONTENT || !response.body) return false;
  const selected = policy(response, deployment);
  if (!selected) return false;
  const createdAt = Date.now();
  const meta: CachedMetadata = {
    createdAt,
    freshUntil: createdAt + selected.freshSeconds * 1000,
    headers: responseHeaders(response),
    staleUntil: createdAt + (selected.freshSeconds + selected.staleSeconds) * 1000,
    status: response.status,
    tags: selected.tags,
    tagVersions: Object.fromEntries(
      selected.tags.map((tag) => [tag, config.cacheTagVersions[tag] ?? "0"]),
    ),
  };
  await env.CONTENT.put(cacheKey, response.body, {
    customMetadata: { cache: JSON.stringify(meta) },
    httpMetadata: { contentType: response.headers.get("content-type") ?? undefined },
  });
  recordUsage(env, deployment.projectId, "isr_writes");
  return true;
}

function forwardedHeaders(request: Request): Array<[string, string]> {
  return ["accept", "accept-language", "user-agent"].flatMap((name) => {
    const value = request.headers.get(name);
    return value ? [[name, value] as [string, string]] : [];
  });
}

async function queueRevalidation(
  request: Request,
  env: Env,
  cacheKey: string,
  projectId: string,
  lockOwner: string,
): Promise<boolean> {
  if (!env.REVALIDATION_QUEUE) return false;
  const message: RevalidationMessage = {
    cacheKey,
    lockOwner,
    projectId,
    requestHeaders: forwardedHeaders(request),
    requestUrl: request.url,
  };
  await env.REVALIDATION_QUEUE.send(message);
  return true;
}

export async function serveFunctionWithCache(
  request: Request,
  env: Env,
  context: ExecutionContext,
  deployment: ControlResolution,
  config: RuntimeProjectConfig,
  generation: CacheGeneration,
): Promise<Response> {
  if (request.method !== "GET" || deployment.cacheMode === "bypass" || !env.CONTENT) {
    return generation.generate();
  }
  const cacheKey = await functionCacheKey(request, deployment);
  const cached = await readCache(env, cacheKey, config);
  if (cached?.state === "fresh") {
    recordUsage(env, deployment.projectId, "isr_reads");
    return cleanResponse(cached.response, "HIT");
  }
  const owner = crypto.randomUUID();
  const acquired = await acquire(env, cacheKey, owner);
  if (cached) {
    recordUsage(env, deployment.projectId, "isr_reads");
    if (acquired) {
      context.waitUntil(
        queueRevalidation(request, env, cacheKey, deployment.projectId, owner).then(
          async (queued) => {
            if (queued) return;
            try {
              const response = await generation.generate();
              await storeGeneratedResponse(env, deployment, config, cacheKey, response);
            } finally {
              await releaseCacheLock(env, cacheKey, owner);
            }
          },
        ),
      );
    }
    return cleanResponse(cached.response, "STALE");
  }
  const response = await generation.generate();
  if (acquired) {
    context.waitUntil(
      storeGeneratedResponse(env, deployment, config, cacheKey, response.clone()).finally(() =>
        releaseCacheLock(env, cacheKey, owner),
      ),
    );
  }
  return cleanResponse(response, "MISS");
}
