import "server-only";

import { type ChildProcess, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import type { Artifact } from "@multivrs/build-utils/artifact";
import type { BuildFunction } from "@multivrs/build-utils/output";
import { createArtifactStore } from "@/lib/artifacts/store";

interface RunningCompute {
  port: number;
  process: ChildProcess;
}

const instances = new Map<string, Promise<RunningCompute>>();

function safeArtifactPath(root: string, path: string): string {
  const target = resolve(root, path);
  if (!target.startsWith(`${root}${sep}`)) {
    throw new Error(`Unsafe compute artifact path: ${path}`);
  }
  return target;
}

async function openPort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Unable to allocate compute port"));
        return;
      }
      const port = address.port;
      server.close((error) => (error ? reject(error) : resolvePort(port)));
    });
  });
}

async function materialize(hash: string, manifest: Artifact): Promise<string> {
  if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error("Invalid artifact hash");
  const root = join(tmpdir(), "multivrs-node-compute", hash);
  const marker = join(root, ".ready");
  try {
    const ready = await readFile(marker, "utf8");
    if (ready === hash) return root;
  } catch {
    // A missing marker means the content-addressed directory is incomplete.
  }

  await rm(root, { recursive: true, force: true });
  await mkdir(root, { recursive: true });
  const store = createArtifactStore();
  for (const file of manifest.files) {
    const bytes = await store.get(file.hash);
    if (!bytes)
      throw new Error(`Compute artifact blob is missing: ${file.path}`);
    const actual = createHash("sha256").update(bytes).digest("hex");
    if (actual !== file.hash) {
      throw new Error(`Compute artifact integrity check failed: ${file.path}`);
    }
    const target = safeArtifactPath(root, file.path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  await writeFile(marker, hash);
  return root;
}

async function waitUntilReady(
  port: number,
  child: ChildProcess,
): Promise<void> {
  let startupError: Error | null = null;
  child.once("error", (error) => {
    startupError = error;
  });
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (startupError) throw startupError;
    if (child.exitCode !== null) {
      throw new Error(`Compute process exited with code ${child.exitCode}`);
    }
    try {
      await fetch(`http://127.0.0.1:${port}/`, {
        signal: AbortSignal.timeout(500),
      });
      return;
    } catch {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
    }
  }
  child.kill();
  throw new Error("Compute process did not become ready");
}

async function startCompute(
  artifactHash: string,
  manifest: Artifact,
  fn: BuildFunction,
): Promise<RunningCompute> {
  if (fn.runtime === "edge") {
    throw new Error(`Local compute does not support the ${fn.runtime} runtime`);
  }
  const artifactRoot = await materialize(artifactHash, manifest);
  const entrypoint = safeArtifactPath(artifactRoot, fn.entrypoint);
  const port = await openPort();
  const executable =
    fn.runtime === "bun"
      ? (process.env.MULTIVRS_BUN_BINARY ?? "bun")
      : process.execPath;
  const child = spawn(executable, [entrypoint], {
    cwd: dirname(entrypoint),
    env: {
      ...process.env,
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      PORT: String(port),
    },
    stdio: "ignore",
  });
  await waitUntilReady(port, child);
  child.once("exit", () => instances.delete(artifactHash));
  return { port, process: child };
}

async function instance(
  artifactHash: string,
  manifest: Artifact,
  fn: BuildFunction,
): Promise<RunningCompute> {
  const current = instances.get(artifactHash);
  if (current) return current;
  const starting = startCompute(artifactHash, manifest, fn);
  instances.set(artifactHash, starting);
  try {
    return await starting;
  } catch (error) {
    instances.delete(artifactHash);
    throw error;
  }
}

export async function invokeNodeCompute(input: {
  request: Request;
  artifactHash: string;
  manifest: Artifact;
  fn: BuildFunction;
  pathname: string;
}): Promise<Response> {
  const running = await instance(input.artifactHash, input.manifest, input.fn);
  const incoming = new URL(input.request.url);
  const target = new URL(input.pathname, `http://127.0.0.1:${running.port}`);
  target.search = incoming.search;
  const headers = new Headers(input.request.headers);
  headers.delete("host");
  headers.delete("content-length");
  if (!headers.has("x-forwarded-host")) {
    headers.set("x-forwarded-host", incoming.host);
  }
  if (!headers.has("x-forwarded-proto")) {
    headers.set("x-forwarded-proto", incoming.protocol.slice(0, -1));
  }
  const hasBody = !["GET", "HEAD"].includes(input.request.method);
  const response = await fetch(target, {
    method: input.request.method,
    headers,
    body: hasBody ? await input.request.arrayBuffer() : undefined,
    redirect: "manual",
  });
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");
  return new Response(input.request.method === "HEAD" ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
