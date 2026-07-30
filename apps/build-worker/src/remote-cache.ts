import type { Sandbox } from "@cloudflare/sandbox";
import type { BuildJob } from "@multivrs/client";
import type { BuildWorkerEnv } from "./build-worker.types";

const ARCHIVE = "/tmp/multivrs-build-cache.tgz";

export async function restoreRemoteCache(
  sandbox: Sandbox,
  job: BuildJob,
  env: BuildWorkerEnv,
  cwd: string,
): Promise<number> {
  const object = await env.BUILD_CACHE.get(cacheKey(job));
  if (!object?.body) return 0;
  await sandbox.writeFile(ARCHIVE, object.body);
  const extracted = await sandbox.exec(`tar -xzf ${ARCHIVE} -C .`, {
    cwd,
  });
  return (await extracted.exitCode) === 0 ? object.size : 0;
}

export async function saveRemoteCache(
  sandbox: Sandbox,
  job: BuildJob,
  env: BuildWorkerEnv,
  cwd: string,
): Promise<number> {
  const archived = await sandbox.exec(
    `found=""; for p in .next/cache .turbo node_modules/.cache; do [ -e "$p" ] && found="$found $p"; done; [ -n "$found" ] && tar -czf ${ARCHIVE} $found`,
    { cwd },
  );
  if ((await archived.exitCode) !== 0) return 0;
  const file = await sandbox.readFile(ARCHIVE, { encoding: "none" });
  const fixed = new FixedLengthStream(file.size);
  await Promise.all([
    file.content.pipeTo(fixed.writable),
    env.BUILD_CACHE.put(cacheKey(job), fixed.readable, {
      customMetadata: { branch: job.input.branch ?? "default", projectId: job.projectId },
    }),
  ]);
  return file.size;
}

function cacheKey(job: BuildJob): string {
  return `projects/${job.projectId}/${encodeURIComponent(job.input.branch ?? "default")}.tgz`;
}
