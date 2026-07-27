import { z } from "zod";
import { contentType } from "./content-type";
import { resolveRequest } from "./resolve";
import type { ArtifactManifest, Env } from "./types";

const imageQuerySchema = z.object({
  q: z.coerce.number().int().min(1).max(100).default(82),
  url: z
    .string()
    .startsWith("/")
    .refine((value) => !value.startsWith("/_image"), "Nested image requests are not allowed"),
  w: z.coerce.number().int().min(16).max(4096),
});

export interface ImageRequestOptions {
  quality: number;
  sourcePath: string;
  width: number;
}

export function parseImageRequest(url: URL): ImageRequestOptions | null {
  const parsed = imageQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return null;
  }
  return { quality: parsed.data.q, sourcePath: parsed.data.url, width: parsed.data.w };
}

function outputFormat(accept: string, source: string): ImageOutputOptions["format"] | null {
  if (accept.includes("image/avif")) return "image/avif";
  if (accept.includes("image/webp")) return "image/webp";
  const type = contentType(source);
  return ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"].includes(type)
    ? (type as ImageOutputOptions["format"])
    : null;
}

export async function serveImage(
  request: Request,
  env: Env,
  context: ExecutionContext,
  manifest: ArtifactManifest,
  artifactHash: string,
): Promise<Response> {
  const options = parseImageRequest(new URL(request.url));
  if (!options) return new Response("Invalid image parameters", { status: 400 });
  if (!env.IMAGES) return new Response("Image optimization is unavailable", { status: 503 });
  const resolved = resolveRequest(manifest, options.sourcePath);
  if (resolved?.type !== "static") {
    return new Response("Source image not found", { status: 404 });
  }
  const format = outputFormat(request.headers.get("accept") ?? "", resolved.file.path);
  if (!format) return new Response("Unsupported source image", { status: 415 });
  const cacheUrl = new URL(request.url);
  cacheUrl.searchParams.set("artifact", artifactHash);
  const cacheKey = new Request(cacheUrl, { method: "GET" });
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;
  const object = await env.ARTIFACTS.get(`blobs/${resolved.file.hash}`);
  if (!object?.body) return new Response("Source image blob not found", { status: 404 });
  const result = await env.IMAGES.input(object.body)
    .transform({ fit: "scale-down", width: options.width })
    .output({ format, quality: options.quality, anim: format === "image/gif" });
  const response = result.response();
  response.headers.set("cache-control", "public, max-age=31536000, immutable");
  response.headers.set("vary", "Accept");
  context.waitUntil(caches.default.put(cacheKey, response.clone()));
  return response;
}
