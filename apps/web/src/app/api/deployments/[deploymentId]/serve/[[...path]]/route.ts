/**
 * Phase 1 private artifact serving path.
 *
 * This is intentionally app-controlled instead of exposing the R2 bucket. The
 * later Cloudflare Worker/Go proxy can reuse the same manifest/blob layout.
 */
import { resolveArtifactRequest } from "@multivrs/build-utils";
import { NotFoundError } from "@multivrs/error-utils";
import { fail } from "@/lib/api/respond";
import { invokeNodeCompute } from "@/lib/artifacts/node-compute";
import { createArtifactStore } from "@/lib/artifacts/store";
import { getPublicDeployment } from "@/lib/services/deployment.service";

interface RouteParams {
  params: Promise<{ deploymentId: string; path?: string[] }>;
}

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
};

function contentType(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot === -1) {
    return "application/octet-stream";
  }
  return CONTENT_TYPES[path.slice(dot)] ?? "application/octet-stream";
}

async function serve(req: Request, { params }: RouteParams) {
  try {
    const { deploymentId, path } = await params;
    const deployment = await getPublicDeployment(deploymentId);
    if (deployment.status !== "ready" || !deployment.artifactHash) {
      throw new NotFoundError("Ready deployment not found");
    }

    const store = createArtifactStore();
    const manifest = await store.getManifest(deployment.artifactHash);
    if (!manifest) {
      throw new NotFoundError("Deployment artifact not found");
    }

    const resolved = resolveArtifactRequest(
      manifest,
      `/${path?.join("/") ?? ""}`,
    );
    if (!resolved) {
      throw new NotFoundError("Artifact file not found");
    }
    if (resolved.type === "function") {
      return invokeNodeCompute({
        request: req,
        artifactHash: deployment.artifactHash,
        manifest,
        fn: resolved.function,
        pathname: `/${path?.join("/") ?? ""}`,
      });
    }

    const bytes = await store.get(resolved.file.hash);
    if (!bytes) {
      throw new NotFoundError("Artifact blob not found");
    }

    return new Response(Buffer.from(bytes), {
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
        "content-type": contentType(resolved.file.path),
      },
    });
  } catch (err) {
    return fail(err);
  }
}

export const GET = serve;
export const POST = serve;
export const PUT = serve;
export const PATCH = serve;
export const DELETE = serve;
export const OPTIONS = serve;
export const HEAD = serve;
