import type { ControlResolution } from "./control";
import type { Env } from "./types";
import { recordUsage } from "./usage";

const PREFIX = "/_multivrs/blob/";

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signature(secret: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

async function safeEqual(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);
  return crypto.subtle.timingSafeEqual(leftHash, rightHash);
}

async function authorizedPrivateBlob(
  request: Request,
  env: Env,
  deployment: ControlResolution,
  pathname: string,
): Promise<boolean> {
  if (!env.BLOB_SIGNING_SECRET) return false;
  const url = new URL(request.url);
  const expires = Number(url.searchParams.get("expires"));
  const provided = url.searchParams.get("signature") ?? "";
  if (!Number.isInteger(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const expected = await signature(
    env.BLOB_SIGNING_SECRET,
    `${deployment.projectId}:${pathname}:${expires}`,
  );
  return safeEqual(provided, expected);
}

export function isBlobRequest(pathname: string): boolean {
  return pathname.startsWith(PREFIX);
}

export async function serveBlob(
  request: Request,
  env: Env,
  deployment: ControlResolution,
): Promise<Response> {
  if (!env.CONTENT) return new Response("Blob storage is unavailable", { status: 503 });
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { headers: { allow: "GET, HEAD" }, status: 405 });
  }
  const raw = new URL(request.url).pathname.slice(PREFIX.length);
  const pathname = raw
    .split("/")
    .map((part) => decodeURIComponent(part))
    .join("/");
  if (!pathname || pathname.split("/").includes("..")) {
    return new Response("Invalid blob path", { status: 400 });
  }
  const object = await env.CONTENT.get(`blobs/${deployment.projectId}/${pathname}`, {
    onlyIf: request.headers,
    range: request.headers,
  });
  if (!object) return new Response("Blob not found", { status: 404 });
  if (!("body" in object)) return new Response(null, { status: 412 });
  if (
    object.customMetadata?.visibility === "private" &&
    !(await authorizedPrivateBlob(request, env, deployment, pathname))
  ) {
    return new Response("Private blob signature is invalid or expired", { status: 403 });
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("accept-ranges", "bytes");
  headers.set("etag", object.httpEtag);
  headers.set(
    "cache-control",
    object.customMetadata?.visibility === "private"
      ? "private, no-store"
      : "public, max-age=31536000, immutable",
  );
  if (object.range) {
    const offset = "offset" in object.range ? (object.range.offset ?? 0) : 0;
    const length = "length" in object.range ? (object.range.length ?? object.size) : object.size;
    headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set("content-length", String(length));
  } else {
    headers.set("content-length", String(object.size));
  }
  recordUsage(env, deployment.projectId, "blob_simple_operations");
  recordUsage(
    env,
    deployment.projectId,
    "blob_data_transfer",
    object.range && "length" in object.range ? object.range.length : object.size,
  );
  return new Response(request.method === "HEAD" ? null : object.body, {
    headers,
    status: object.range ? 206 : 200,
  });
}
